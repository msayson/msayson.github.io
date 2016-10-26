---
layout: post
title:  "Supervised learning"
date:   2016-10-20 20:30:00 -0800
categories: artificial-intelligence
---
One of the main areas covered in the machine learning course I'm taking at UBC is supervised learning and its major concepts and algorithms.

Supervised learning is the machine learning task of inferring a predictive model from an initial set of labelled examples.

The most common application is classification of data, however, supervised learning can also be applied to predictive scores - "How will customers like this product, given their ratings of related products?" - and autonomous decision making - "What is the expected risk associated with a given decision?" "(Deepmind's AlphaGo:) What is the best response to Lee Sedol's last move?" "(Self-driving cars:) How should each of my components adjust to the latest feedback from my sensors?".

Some of the most popular algorithms in supervised learning are random forests, support vector machines and neural networks. Factors to consider in selecting which algorithm to use for an application include the prediction accuracy and liveness required, the scale of the data and the number of features that need to be considered, the computational power and memory available, the amount of time allowable for the training phase, and the amount of expertise available.

### General structure

At an abstract level, supervised classification algorithms programmatically construct a classification model based on labelled training examples. Potential models are compared by evaluating their error rates against an independent set of labelled test examples, and the model with the lowest test error is selected.

1. Collect labelled examples and generate a training set and a test set.
2. Generate a model using the training set.
3. Evaluate the model's error rate on the test set.

### Considerations

#### Working with limited or skewed data
In order for our model to make successful predictions on real-world examples, we need to train on a large number of well-distributed examples.

The public domain provides a vast array of tagged images, videos, historical data sets and other documents, which, if applicable to the application, can often provide an accessible source of labelled examples. However, obtaining training data that can represent the entire problem domain can still be a challenge - see [Advances In Computer Vision, and Chasing the Long Tail]({% post_url 2016-06-06-advances-in-computer-vision-and-chasing-long-tail %}) for more on that topic.

#### Pre-processing data
Machine learning algorithms generally assume that their input examples have the same structure and are equally reliable.

For our learning algorithm to be successful, we may need to transform data sources into a common format, select a common subset of features to take into consideration, remove records with invalid values, and handle duplicate or missing records.

#### Avoiding overfitting to training data
Given that it's likely for future examples to differ at least slightly from our training data, we also have to protect against overfitting our models to our training examples. That is, our model should not so closely align with our training examples that it incorrectly categorizes many examples that were not in our training set.

A common way to avoid overfitting is to select separate random distributions of labelled data for training and testing, and to select the model that minimizes our test error rather than our training error.

In order for this to work, we have to enforce that the training phase must not rely on test error, however tempting it may be to retrain on the test data to reduce the test error. Training on the data that we use to evaluate the model's error rate simply shifts the overfitting problem from one sample to another, and the point of the test set is to evaluate how well we do on new data.

Another source of overfitting is when our examples have a high number of features relative to the sample size, or our examples include features that are entirely unrelated to the label. Extraneous features make it much more likely for noise and chance patterns to become integrated into the model, which increases our risk of misclassifying future data.

Supervised learning can be most successfully applied when the following hold true:

* We have a reliable source of labelled training data.
* Our training data is well-distributed across feature values from the problem domain.

### Cross-validation

We want to be able to evaluate our models in a way that approximates the real-world error rate, so that we don't report a 10% error rate on our model during training but observe a 75% error rate in practise.

When labelled data is very limited, a technique called [cross-validation](https://en.wikipedia.org/wiki/Cross-validation_%28statistics%29) is often used to allow us to train on all our data and still estimate our test error reasonably accurately.

K-fold cross-validation is one example of cross-validation.

#### K-fold cross-validation algorithm

1. Randomly partition the labelled data set into k equally-sized sample sets.
2. Set one sample as a validation set, and the remaining samples as a training set.
3. Train and calculate the error of a model using step 2's training and validation sets.
4. Repeat steps 2-3 to generate an error for each of the k possible training/validation sets.
5. Average the k errors to obtain the cross-validation error.

#### Using cross-validation error

The main idea is that the cross-validation error approximates the error rate of a model trained on all of our labelled data.  Randomizing the order of examples before splitting them into validation sets helps with this, as does having training examples that are independently and randomly selected from the population.

Increasing the number of folds, k, generally increases the accuracy of our error approximation, while making it more expensive to calculate.

If cross-validation error is a reasonable approximation of test error on new data, then we should be able to use cross-validation error to choose between possible models.

Training on millions of possible model parameters and selecting the one with the best cross-validation error will almost certainly give us an overfitted model.  If we try out millions of possible combinations of parameters, the combinations that are the closest match to our training data won't necessarily extrapolate as well to new data.

However, as long as we only train a small number of likely models and our samples are well-distributed, the cross-validation process allows us to select the best model without too much bias towards any given set of our data.

### Caveats

*Supervised learning is not magic.*

If you have enough reliable data, you may be able to apply statistical methods and simplified models to make reasonable predictions of what other data will look like.

That sounds less powerful than saying, "supervised learning can predict the future!", but it's probably more accurate.  Supervised learning algorithms make generous use of heuristics that appear to work reasonably well in practise.

Also, supervised learning can only solve certain problems.  If we can characterize a problem as a classification problem and we have a significant number of labelled examples, then supervised learning may be able to provide useful results.

The good thing is that there are many models that scale up well, so if the model's assumptions hold for our data and we keep on accumulating training data, we can generate more and more accurate models.

*It's easy to overfit.*

Evaluating our model with an independent test set helps a bit, but we need to be aware of all the factors that go into overfitting for our given model.

For example, in the condensed version of the [k-nearest neighbours](https://en.wikipedia.org/wiki/K-nearest_neighbors_algorithm) algorithm, the order of training examples can have a significant impact on our model, and we need to remember to randomize the order of training examples to get accurate results.

*Learning models with historical data don't necessarily predict future results.*

A random sample from a population can give us information that has a _high probability_ of being true of the population _at that time_.

If our problem space has features that change significantly over time, then classification algorithms that give all examples the same weight may not work as well if most of our data is from several years ago.

### Summary

Supervised learning algorithms use an initial set of labelled data to "learn" a prediction model that can be applied to future data. Labelled data is divided into training and test samples, which are ideally independent and representative of the distribution of actual data, and the training phase must not be influenced by the test data in any way to avoid overfitting our model to our data.

If there isn't enough labelled data for us to split it into training and test samples and still obtain satisfactory results, then cross-validation can be applied to evaluate our models while training on all our data.  If we evaluate a small number of models using cross-evaluation and pick the one with the lowest error, we can produce a fairly accurate and unbiased prediction model.

Supervised learning isn't a magic solution to every problem, and each algorithm makes some assumptions that must be true of your data for it to work well.  However, it can be a powerful tool if you understand where and how to apply it.

Resources:

* [Machine Learning and Data Mining](http://www.cs.ubc.ca/~schmidtm/Courses/340-F16/) (UBC CPSC 340)
