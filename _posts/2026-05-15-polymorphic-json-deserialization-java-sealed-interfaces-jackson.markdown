---
layout: post
title: "Polymorphic JSON deserialization with Java sealed interfaces and Jackson"
date: 2026-05-15 20:30:00 -0800
categories: programming-languages
excerpt: "<p>When building a JSON-based API that accepts multiple request types, you often need a strategy for mapping incoming payloads to the appropriate data model.  Java sealed interfaces combined with Jackson's polymorphic type annotations provide a clean way to support multiple strongly typed backend data models.</p>"
---

When building a JSON-based API that accepts multiple request types, you often need a strategy for mapping incoming payloads to the appropriate data model.  Java sealed interfaces combined with Jackson's polymorphic type annotations provide a clean way to support multiple strongly typed backend data models.

## Problem
Consider an API that receives data processing requests.  Each request provides a `requestType` field that determines which fields are relevant.

All requests share the same lifecycle and processing steps, but each request type corresponds to a different data model with different required and optional fields.

For example:

* Account deletion: `{"requestId": "request-1234", "requestType": "deleteAccount", "accountId": "1234"}`
* Profile deletion: `{"requestId": "request-1234", "requestType": "deleteProfile", "accountId": "1234", "profileId": "profile-1234"}`
* Scoped data deletion: `{"requestId": "request-1234", "requestType": "deleteScopedData", "accountId": "1234", "profileId": "profile-1234", "scope": {"deletePurchaseHistory": true, "deleteSubscriptions": false, "deletePreferences": false}}`

## Approach: Sealed interface + Jackson annotations

### Step 1: Define sealed interface with annotations mapping request types to implementations

```java
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

/**
 * Polymorphic deletion request interface that routes to request-type-specific data models.
 */
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "requestType")
@JsonSubTypes({
    @JsonSubTypes.Type(value = AccountDeletionRequest.class, name = "deleteAccount"),
    @JsonSubTypes.Type(value = ProfileDeletionRequest.class, name = "deleteProfile"),
    @JsonSubTypes.Type(value = ScopedDataDeletionRequest.class, name = "deleteScopedData")
})
public sealed interface DeletionRequest
        permits AccountDeletionRequest, ProfileDeletionRequest, ScopedDataDeletionRequest {
    // Define common method declarations and static methods here.

    /**
     * Throws IllegalArgumentException if value is null or blank.
     */
    static void requireNonBlank(final String value, final String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(fieldName + " must not be null or blank");
        }
    }
}
```

Java interfaces allow us to keep core business logic independent of child implementation details, making the system easier to test and extend.  Sealed interfaces, available in Java 17+, restrict which classes are allowed to implement the interface via a `permits` clause.

When combined with Jackson `@JsonTypeInfo` and `@JsonSubTypes` annotations which wire the JSON discriminator field (here, `requestType`) to the appropriate implementation, this enables a polymorphic contract with automatic, compile-time-checked JSON routing to strongly typed implementations.

### Step 2: Define concrete implementations as classes or records

In the following implementations of DeletionRequest, we set `@JsonIgnoreProperties(ignoreUnknown = true)` to ignore unmentioned attributes when deserializing JSON strings matching known request types.

This allows us to:
* Maintain strong typing for attributes relevant to this service while being agnostic of other upstream attributes our service doesn't use
* Avoid listing irrelevant or redundant attributes including requestType in request-type-specific data models
* Add/remove/update attributes unrelated to this service in upstream data providers without causing downstream runtime failures

You can drop `@JsonIgnoreProperties` if you prefer to enforce the complete possible schema of input JSON strings, which will throw a runtime exception when receiving any new attribute you haven't defined.

```java
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Data model for account deletion requests.
 *
 * Account and request IDs are required, no other fields needed.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record AccountDeletionRequest(
    String accountId,
    String requestId
) implements DeletionRequest {
    public AccountDeletionRequest {
        DeletionRequest.requireNonBlank(accountId, "accountId");
        DeletionRequest.requireNonBlank(requestId, "requestId");
    }
}

/**
 * Data model for profile deletion requests.
 *
 * Account, profile, and request IDs are required, no other fields needed.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record ProfileDeletionRequest(
    String accountId,
    String profileId,
    String requestId
) implements DeletionRequest {
    public ProfileDeletionRequest {
        DeletionRequest.requireNonBlank(accountId, "accountId");
        DeletionRequest.requireNonBlank(profileId, "profileId");
        DeletionRequest.requireNonBlank(requestId, "requestId");
    }
}

/**
 * Data model for scoped data deletion requests.
 *
 * Used when users want to delete partial data without closing their account.
 *
 * Account ID, request ID, and scope are required, profile ID is optional.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record ScopedDataDeletionRequest(
    String accountId,
    String profileId,
    String requestId,
    DeletionScope scope
) implements DeletionRequest {
    public ScopedDataDeletionRequest {
        DeletionRequest.requireNonBlank(accountId, "accountId");
        DeletionRequest.requireNonBlank(requestId, "requestId");
        if (scope == null) {
            throw new IllegalArgumentException("scope must not be null");
        }
    }
}

/**
 * Data model for data deletion scope.
 *
 * Used when user requests deleting specific categories of data.
 */
public record DeletionScope(
    boolean deletePreferences,
    boolean deletePurchaseHistory,
    boolean deleteSubscriptions
) {}
```

### Step 3: Deserialize input JSON strings to strongly typed data models

```java
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.exc.InvalidTypeIdException;

// Note: Prefer to instantiate ObjectMapper once as static final field or singleton and reuse across classes.
// ObjectMapper is thread-safe, and it's expensive to create new instances.
final ObjectMapper mapper = new ObjectMapper();

final DeletionRequest deletionRequest;
try {
    deletionRequest = mapper.readValue(inputJson, DeletionRequest.class);
} catch (final InvalidTypeIdException e) {
    // Replace BadRequestException in catch statements with locally relevant class for 400 Bad Request exceptions
    throw new BadRequestException("Unsupported request type", e);
} catch (final JsonProcessingException e) {
    throw new BadRequestException("Invalid request payload", e);
}
```

With Java 21+, the compiler enforces that every permitted subtype in switch statements on sealed interface instances are handled, removing a class of potential runtime errors.

## When to apply this pattern

**First, consider whether a polymorphic API is the right design.**

A single endpoint accepting multiple JSON schemas is appropriate when all request types go through the same lifecycle and infrastructure (authorization, data processing steps, queues, auditing/reporting) and only diverge in per-request-type execution logic.

Prefer separate endpoints when:
* Request types have different authorization rules or rate limits.
* Request types have diverging lifecycles.
* You need clean separation of concerns and auto-generated data models or documentation for each request type's schema.  Frameworks like OpenAPI, Swagger, and Smithy don't work as well with polymorphic schemas, which can be more difficult for clients to consume and understand.

Sealed interfaces and Jackson polymorphic type annotations are a good fit for implementing polymorphic schemas when all the following are true:

* Your JSON payloads share a discriminator field but have different schemas per type.
* You want a closed set of permitted subtypes.
* You want subtypes to be strongly typed, each potentially requiring its own validation logic.

They are a poor fit when either of the following are true, in which case abstract classes may be a better replacement for sealed interfaces:

* Other teams need to be able to add subtypes without modifying your code (sealed interface subtypes must be defined in the same module).
* You cannot use Java 17+, the first Long Term Support version supporting sealed interfaces.

## Pros and cons vs common alternatives

<table>
  <thead>
    <tr>
      <th>Strategy</th>
      <th>Pros</th>
      <th>Cons</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><b>Sealed interface + Jackson polymorphism</b></td>
      <td>
        <ul>
          <li>Supports strongly typed subtypes with different required and allowed fields</li>
          <li>Easily add subtypes with minimal code changes</li>
          <li>Compile-time rejection of unsupported subtypes</li>
          <li>Clean pattern matching without casting</li>
        </ul>
      </td>
      <td>
        <ul>
          <li>Requires all subtypes to be defined in same module</li>
          <li>Requires Java 17+</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td><b>Single class with nullable fields</b></td>
      <td>
        <ul>
          <li>Simple</li>
          <li>Works pre-Java 17</li>
        </ul>
      </td>
      <td>
        <ul>
          <li>Runtime null checks everywhere</li>
          <li>No compile-time safety</li>
          <li>Unclear which fields apply to each type</li>
          <li>More messy to enforce validations on subtypes</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td><b>Inheritance with abstract class</b></td>
      <td>
        <ul>
          <li>Familiar OOP pattern</li>
          <li>Subclasses can live anywhere</li>
          <li>Works pre-Java 17</li>
        </ul>
      </td>
      <td>
        <ul>
          <li>Anyone can subclass, no compile-time restriction on subtypes</li>
          <li>Compiler does not enforce exhaustive handling of subtypes</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td><b><code>@JsonAnySetter</code> with <code>Map&lt;String, Object&gt;</code></b></td>
      <td>
        <ul>
          <li>Maximum flexibility</li>
          <li>Allows for unknown schemas</li>
          <li>Works pre-Java 17</li>
        </ul>
      </td>
      <td>
        <ul>
          <li>Zero type safety, accepts all inputs</li>
          <li>Validation is manual and error-prone</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td><b>Enum and factory method</b></td>
      <td>
        <ul>
          <li>Explicit type registry (as with sealed interface)</li>
          <li>More flexible, full control over deserialization</li>
          <li>Works pre-Java 17</li>
        </ul>
      </td>
      <td>
        <ul>
          <li>More boilerplate code than sealed interface + annotations</li>
          <li>No compile-time validation of correct/complete routing</li>
        </ul>
      </td>
    </tr>
  </tbody>
</table>

## Key takeaways

1. `sealed` provides a closed type hierarchy so the compiler knows every possible implementation.
2. Jackson's `@JsonTypeInfo` simplifies routing deserialization to the appropriate type based on a discriminator field.
3. Java records minimize boilerplate for immutable, validated data models.

Sealed interfaces with Jackson polymorphism are especially effective for API contracts where the full schema is owned by your team, and reduce the effort to add new subtypes compared to other options.
