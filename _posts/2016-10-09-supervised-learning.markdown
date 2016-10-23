---
layout: post
title:  "Supervised learning"
date:   2016-10-20 20:30:00 -0800
categories: artificial-intelligence
---
I'm currently taking an undergraduate course in machine learning at UBC, and one of the topics we're covering is supervised learning and its major concepts and algorithms.

Supervised learning is the machine learning task of inferring a predictive model from an initial set of labelled examples.

The most common application is classification of data, however, supervised learning can also be applied to predictive scores - "How will customers like this product, given their ratings of related products?" - and autonomous decision making - "What is the expected risk associated with a given decision?" "(Deepmind's AlphaGo:) What is the best response to Lee Sedol's last move?" "(Self-driving cars:) How should each of my components adjust to the latest feedback from my sensors?".

Some of the most popular algorithms in supervised learning are random forests, support vector machines and neural networks. Factors to consider in selecting which algorithm to use for an application include the prediction accuracy and liveness required, the scale of the data and the number of features that need to be considered, the computational power and memory available, the amount of time allowable for the training phase, and the amount of expertise available.

### General Structure

At an abstract level, supervised classification algorithms programmatically construct a classification model based on labelled training examples. Potential models are compared by evaluating their error rates against an independent set of labelled test examples, and the model with the lowest test error is selected.

1. Collect labelled examples and generate a training set and a test set.
2. Generate a model using the training set.
3. Evaluate the model's error rate on the test set.

### Challenges and Considerations

#### Limited or Skewed Data
In order for the model to make successful predictions on real-world examples, it's necessary to train on a large number of well-distributed examples.

The public domain provides a vast array of tagged images, videos, historical data sets and other documents, which, if applicable to the application, can often provide an accessible source of labelled examples. However, obtaining training data that can represent the entire problem domain can still be a challenge - see [Advances In Computer Vision, and Chasing the Long Tail]({% post_url 2016-06-06-advances-in-computer-vision-and-chasing-long-tail %}) for more on that topic.

#### Irregularities Between Data Sources
Data normalization may be non-trivial when combining a variety of data sources with different features, distributions, and levels of reliability. For our learning algorithm to be successful, we may need to pre-process our data to transform data sources into a common format, select a common subset of features to take into consideration, remove records with invalid values, and handle duplicate or missing records.

#### Overfitting to Training Data
Given that it's likely for future examples to differ at least slightly from our training data, we also have to protect against overfitting our models to our training examples. That is, our model should not so closely align with our training examples that it incorrectly categorizes many examples that were not in our training set.

We want to be able to evaluate our models in a way that approximates the real-world error rate, so that we don't report a 10% error rate on our model during training but observe a 75% error rate in practise.

A common way to avoid overfitting is to select separate random distributions of labelled data for training and testing, and to select the model that minimizes our test error rather than our training error.

In order for this to work, we have to enforce that the training phase must not rely on test error, however tempting it may be to retrain on the test data to reduce the test error. Training on the data that we use to evaluate the model's error rate simply shifts the overfitting problem from one sample to another, and the point of the test set is to evaluate how well we do on new data.

Another source of overfitting is when our examples have a high number of features relative to the sample size, or our examples include features that are entirely unrelated to the label. Extraneous features make it much more likely for noise and chance patterns to become integrated into the model, which increases our risk of misclassifying future data.

When labelled data is very limited, a technique called [cross-validation](https://en.wikipedia.org/wiki/Cross-validation_%28statistics%29) is often used to increase the probability of our results being applicable to future data and reduce the probability of overfitting.

### K-Fold Cross-Validation:

1. Randomly partition the labelled data set into k equally-sized samples.
2. Set aside one sample to use for validation, and train a small number of models with different parameters on the remaining k-1 training samples.
3. Evaluate each model's error rate using the validation set, and select the model with the lowest validation error.
4. Repeat steps 2-3 to generate k sub-models for each of the k possible validation sets.
5. Average the k sub-models to produce a single model as output.

The way in which the sub-models are combined depends on the learning algorithm, but the general idea is widely applicable. As long as our samples are well-distributed and we only train a small number of likely models on each training sample, the cross-validation process reduces the risk that our model will be biased towards any given set of our data.

Supervised learning can be most successfully applied when the following hold true:

* We have a reliable source of labelled training data.
* Our training data is well-distributed across feature values from the problem domain.

### Conclusion

In summary, supervised learning algorithms use an initial set of labelled data to "learn" a prediction model that can be applied to future data. Labelled data is divided into training and test samples, which are ideally independent and representative of the distribution of actual data, and the training phase must not be influenced by the test data in any way.

If there is not enough labelled data available for us to split it into training and test samples and still obtain satisfactory results, then cross-validation can often be applied to average training results across multiple cross-sections of our data to produce a fairly accurate and unbiased prediction model.

Resources:

* [Machine Learning and Data Mining](http://www.cs.ubc.ca/~schmidtm/Courses/340-F16/) (UBC CPSC 340)
