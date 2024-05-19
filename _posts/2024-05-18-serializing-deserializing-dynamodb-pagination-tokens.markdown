---
layout: post
title:  "Serializing and deserializing DynamoDB pagination tokens to support paginated APIs"
date:   2024-05-18 10:00:00 -0700
categories: aws
---

When using AWS's Java 2.x SDK, DynamoDB scan and query responses provide pagination tokens in a `Map<String, AttributeValue> lastEvaluatedKey` object, which represents the primary key of the last processed DynamoDB item.  You can then pass this value as the "exclusive start key" for the next query to get the next page of results.

When your service retrieves all pages of results locally, this isn't a problem.  However, when you want to provide a paginated API backed by DynamoDB, you'll need to convert this attribute value map into a format that can be passed over HTTP, AKA "serialize" the object into a string.

When your client requests the next page of results with that string pagination token, you'll also need to convert that string back into the `Map<String, AttributeValue>` format that the AWS SDK expects, AKA "deserialize" the string to the original data structure.

## Prior method for serializing/deserializing pagination tokens

Before May 2023, building paginated APIs backed by DynamoDB was not very convenient, as you'd have to build your own custom serialization and deserialization code.

Example implementation using Immutables and Jackson, with a sample DynamoDB table primary key that has both a partition key and a sort key:

```java
import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import org.immutables.value.Value.Immutable;
import org.immutables.value.Value.Parameter;
import org.immutables.value.Value.Style;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;

import java.io.IOException;
import java.util.Base64;
import java.util.Map;

/**
 * Serializable representation of a Product DynamoDB pagination token.
 * Using Immutables to generate safe, immutable value objects.
 * @see https://immutables.github.io/
 */
@JsonDeserialize(builder = ProductNextTokenBuilder.class)
@JsonSerialize
@Style(visibility = Style.ImplementationVisibility.PRIVATE)
@Immutable
interface ProductNextToken {
    @Parameter
    String getPartitionKey();
    @Parameter
    String getSortKey();
}

/**
 * Class encapsulating logic to convert DynamoDB pagination tokens between attribute value
 * maps used by the AWS SDK, and string values that can be passed over HTTP.
 */
class ProductSerializer {
    private static final PRODUCT_TABLE_PARTITION_KEY = "YourDynamoDBTablePartitionKeyName";
    private static final PRODUCT_TABLE_SORT_KEY = "YourDynamoDBTableSortKeyName";

    ProductSerializer(final ObjectMapper objectMapper) {
      this.objectMapper = objectMapper;
    }

    /**
     * Serialize a lastEvaluatedKey from an attribute value map to a string.
     *
     * @param lastEvaluatedKey attribute map returned by paginated DynamoDB queries.
     * @return serialized String token that can be passed over HTTP.
     * @throws JsonProcessingException exception thrown if unable to parse the key.
     */
    public String serializeLastEvaluatedKey(final Map<String, AttributeValue> lastEvaluatedKey) throws JsonProcessingException {
        if (lastEvaluatedKey == null) {
            return null;
        }

        final ProductNextToken tokenObject = new ProductNextTokenBuilder()
            .partitionKey(lastEvaluatedKey.get(PRODUCT_TABLE_PARTITION_KEY))
            .sortKey(lastEvaluatedKey.get(PRODUCT_TABLE_SORT_KEY))
            .build();

        return Base64.getUrlEncoder().encodeToString(objectMapper.writeValueAsBytes(tokenObject));
    }

    /**
     * Deserialize a lastEvaluatedKey from a string to an attribute value map.
     *
     * @param lastEvaluatedKey attribute map returned by paginated DynamoDB queries.
     * @return serialized String token that can be passed over HTTP.
     * @throws IOException exception thrown if unable to decode encodedLastEvaluatedKey.
     * @throws JsonParseException exception thrown if unable to deserialize the decoded key into a ProductNextToken.
     */
    public Map<String, AttributeValue> deserializeLastEvaluatedKey(final String encodedLastEvaluatedKey) throws IOException, JsonParseException {
      if (encodedLastEvaluatedKey == null) {
          return null;
      }

      final ProductNextToken deserializedToken = objectMapper.readValue(
          Base64.getUrlDecoder().decode(encodedLastEvaluatedKey),
          ProductNextToken.class
      );

      final AttributeValue partitionKeyValue = AttributeValue.builder()
          .s(deserializedToken.getPartitionKey())
          .build();

      final AttributeValue sortKeyValue = AttributeValue.builder()
          .s(deserializedToken.getSortKey())
          .build();

      return Map.of(
          PRODUCT_TABLE_PARTITION_KEY, partitionKeyValue,
          PRODUCT_TABLE_SORT_KEY, sortKeyValue
      );
    }
}
```

This is a lot of code to maintain and test, with multiple exception cases.  We can remove the dependency on specific key structure by generalizing the code to iterate over the map and JSON key-value pairs, as shown in [https://github.com/aws/aws-sdk-java-v2/issues/3224](https://github.com/aws/aws-sdk-java-v2/issues/3224), but this is still more complex than should be necessary for what we'd prefer to be simple "stringify" and "unstringify" methods.

## Serialization/deserialization with the DynamoDB Enhanced Document library

Since May 2023, AWS's Java 2.x SDK includes an Enhanced Document library that simplifies converting pagination tokens between the AWS SDK's objects and JSON strings that can be passed over HTTP.

The [software.amazon.awssdk.enhanced.dynamodb.document.EnhancedDocument](https://sdk.amazonaws.com/java/api/latest/software/amazon/awssdk/enhanced/dynamodb/document/EnhancedDocument.html) class includes utility methods that make serialization and deserialization one-liners.

AWS blog post demonstrating use cases: [https://aws.amazon.com/blogs/devops/introducing-the-enhanced-document-api-for-dynamodb-in-the-aws-sdk-for-java-2-x/](https://aws.amazon.com/blogs/devops/introducing-the-enhanced-document-api-for-dynamodb-in-the-aws-sdk-for-java-2-x/)

Sample code for converting between `Map<String, AttributeValue>` pagination tokens and JSON strings:

```java
import software.amazon.awssdk.enhanced.dynamodb.document.EnhancedDocument;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;

import java.io.UncheckedIOException;

/**
 * Class encapsulating logic to convert DynamoDB pagination tokens between attribute value
 * maps used by the AWS SDK, and string values that can be passed over HTTP.
 */
class ProductSerializer {
    /**
      * Convert a DynamoDB attribute value map to a JSON string.
      * @param attributeValueMap DynamoDB item key represented as a map from attribute names to attribute values
      * @return String JSON string representation of the DynamoDB item key
      */
    public String serializeLastEvaluatedKey(final Map<String, AttributeValue> attributeValueMap) {
        return EnhancedDocument.fromAttributeValueMap(attributeValueMap).toJson();
    }

    /**
      * Convert a JSON string representation of a DynamoDB pagination token to the format required by DynamoDB API calls.
      * @param paginationTokenJson JSON string representing the last paginated API call's last evaluated record key
      * @return Map<String, AttributeValue> exclusive start key for the next paginated DynamoDB scan/query API call
      * @throws UncheckedIOException exception thrown if fail to parse pagination token
      */
    public Map<String, AttributeValue> deserializeLastEvaluatedKey(final String paginationTokenJson) throws UncheckedIOException {
        return EnhancedDocument.fromJson(paginationTokenJson).toMap();
    }
}
```

This is much more manageable, with serialization and deserialization functionality now provided out-of-the-box as part of the standard AWS SDK.

We can pass this serialized JSON string to our API clients as the client-facing pagination token.  Optionally, if it's important to us to obfuscate our internal DynamoDB key structure from clients, we can add back a Base64 encode/decode layer on top of the JSON strings using the same code snippets from the earlier example.
