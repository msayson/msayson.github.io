---
layout: post
title:  "What's risk management?"
date:   2017-06-24 19:00:00 -0800
categories: security
excerpt: "<p>Risk management is one of the topics covered in the introductory computer security course at UBC, and it's relevant to many other fields including finance, engineering, and project management.</p><p>The main idea is simple: when a project involves high-value assets, an effective approach is to identify all of the relevant risks and evaluate their impact and likelihood in order to prioritize them and determine appropriate countermeasures.</p>"
---

Risk management is one of the topics covered in the introductory computer security course at UBC, and it's relevant to many other fields including finance, engineering, and project management.

The main idea is simple: when a project involves high-value assets, an effective approach is to identify all of the relevant risks and evaluate their impact and likelihood in order to prioritize them and determine appropriate countermeasures.

For new projects, one of the best ways to head off issues is to integrate security requirements into the development process, along with the traditional approach of periodically performing risk assessments and risk mitigation.

This post draws from my notes from Security Software Development: Assessing and Managing Security Risks (Ashbaugh), Software Security: Building Security In (McGraw), and UBC CPEN 442 Introduction to Computer Security (Beznosov).

### An example from Human Resources

In a Human Resources department, risks may include unexpected staff departures, sick leaves, bad hires, and improper workplace behaviour.

For example, suppose we identify a few individuals without which our department would collapse.  If they're engaged in their work but we expect other companies to court them, then we might rate the impact of one of their departures as high and the likelihood as medium.  We've identified a potential point of failure, and can look for ways to improve our organization's robustness.

In parallel to any employee retention strategies, we can encourage subject experts to mentor other promising employees, assign tasks to a more varied set of people so that specialized knowledge spreads across the team, and encourage basic documentation so that new team members can easily ramp up.

If these measures go into practise, we expect the impact of individual employee departures to shift to a manageable level, decreasing the overall risk of such events.

### Motivation for software security risk analysis

Many modern software applications are web-based and interact with many users and external services.  This wider attack surface increases the potential for vulnerabilities that may be exploited, and security incidents can often have a [high financial cost](https://securityintelligence.com/media/2016-cost-data-breach-study) if they disrupt business operations or impact user data.

For large systems, it's often impractical to find and fix every possible vulnerability.  However, it's still possible to track and manage many of the risks.

When we're able to measure an event's risk level before and after implementing a safeguard, we can also better judge which safeguards are most worthwhile.

### Identifying assets

The first step in any risk analysis is to identify the critical assets.  These may include physical resources, services, intellectual property, and various types of company and user data.

We can identify assets by brainstorming with team representatives, reviewing organizational documents such as system architecture and data flow diagrams, and referencing lists from similar projects and security websites.  This doesn't have to take long, and the simple act of recognizing the items of value improves our chances of adequately protecting them.

For example, we may consider the following assets for an ATM bank machine:

* Physical cash and deposited cheques
* Bank cards
* Account numbers and PIN numbers
* Account balances
* Transactions
* Transaction metadata and logs
* Access to external databases
* Software used to run the ATM

### Identifying threats

Threats are any source of danger to the organization, both business-oriented and system-oriented.  Threats can be human, technical, or environmental, targeted or untargeted, and deliberate or unintentional.

Business threats affect underlying business operations or resources, and often arise from unexpected system states or interactions.  For example, incorrect client information may result in a missed contract.

System threats directly target the software and hardware, making them easier to recognize.  A user may attempt to access resources without authorization, or input data that crashes the server.

| Human threats | Technical threats | Environmental threats |
| --- | --- | --- |
| Improper access of resources | Data corruption | Electromagnetic interference |
| Data entry errors | System failures | Power fluctuations |
| Fraud | Exploitation of known vulnerabilities | Changes in temperature |
| Espionage | Denial of service attacks | Changes in humidity |
| Policy violations | Data tampering | |
| Other improper system use | | |
| Design and development errors | | |
{:.table-small-borderless}

Natural disasters are rarely considered, but high potential costs may encourage companies to replicate high-value data in multiple regions.  Financial institutions can't risk losing all their data in case of a hurricane or earthquake, and the same goes for many other major organizations.

### Identifying vulnerabilities

Vulnerabilities are weaknesses in a system that could allow a threat to compromise an asset's confidentiality, integrity, or availability.  Most complex systems have both design flaws and implementation bugs, and the earlier in the development process they're discovered, the easier it is to resolve them.

Companies such as Microsoft and Cigital have reported that over half of their discovered security vulnerabilities have turned out to be design flaws (Software Security, McGraw), so it's worth building security requirements into the design specifications and verifying them early on.

The [IEEE Computer Society’s Center for Secure Design](https://cybersecurity.ieee.org/center-for-secure-design) provides resources on designing secure software and avoiding common design flaws, and organizations such as [OWASP](https://www.owasp.org/index.php/Main_Page) report on the most common web application vulnerabilities.

### Determining risk levels

Once we've identified our system's potential threats and vulnerabilities, we can join the two lists to produce relevant threat-vulnerability pairs and their corresponding threat actions.

For example, consider a third party who may listen to network traffic (threat), and an authentication process that transmits user credentials in plain text (vulnerability).  A matching threat action would be for the third party to eavesdrop on authentication traffic, giving them access to the credentials of users on the same network.

Traditionally, risk level is calculated as the impact times the likelihood of the threat action.

<b>Risk level = Impact × Likelihood</b>

Therefore, a threat action that we expect to cause $1000 of damage/occurrence and occur 1000 times/year will be considered just as important as a once-a-year event that causes $1M of damage.

### Qualitative vs Quantitative Approaches

Either qualitative or quantitative approaches can be used for risk assessments, depending on how much relevant and accurate data is available, and how important precise risk levels are to the business.

Insurance companies manage frequent events that cost a great deal of money, so it's important for them to accurately predict the cost and probability of events that they cover.  They're also in an excellent position to collect accurate data, making quantitative analysis a clear choice for them.

Software companies don't often have the same level of data reporting for security incidents, so it can be difficult to determine the probabilities of many threat actions.  It can also be difficult to determine the value of intangible assets such as user data, intellectual property, and reputation, so qualitative analyses are more often used for software projects.

| | Low Impact | Medium Impact | High Impact |
| --- | --- | --- | --- |
| <b>Low Likelihood</b> | Low Risk | Low Risk | Medium Risk |
| <b>Medium Likelihood</b> | Low Risk | Medium Risk | High Risk |
| <b>High Likelihood</b> | Medium Risk | High Risk | Critical Risk |
{:.table-small-bordered}

### Risk mitigation strategy

Once developers are aware of the highest-risk items, they can put forward possibilities for how to address them, determine which to implement based on cost-to-benefit, and integrate agreed-upon changes into their development plans according to priority.

There are four common ways to address risk:

* Risk can be *reduced* by planning design changes or countermeasures that eliminate the vulnerabilities, or reduce their impact or likelihood of being executed.

* Risk can be *avoided* by eliminating problematic functionality or adjusting the project scope when there are no effective countermeasures and the risk is considered too high.

* Risk can be *transferred* when a third party is willing to insure or take responsibility for specific incidents as part of their business contract, and the critical assets can be recovered.

* Risk can be *accepted* as necessary when there are no effective countermeasures but the feature is considered essential.

### Summary

A typical risk assessment consists of:

* Identifying system assets, threats, and vulnerabilities
* Assessing which threat-vulnerability pairs provide relevant threat actions
* Determining the impact and likelihood of each threat action
* Calculating each threat actions's risk level as impact X likelihood

Determining the impact and likelihood of threat actions can be difficult without accurate data, but qualitative scales can yield ranks that are reasonable for our purpose.

Given a list of threat actions, impacts, and likelihoods, developers can prioritize their efforts based on risk level to the business.  By reassessing risks periodically, organizations can monitor their risk levels and security readiness over time.

Helpful resources:

* [IEEE Computer Society’s Center for Secure Design](https://cybersecurity.ieee.org/center-for-secure-design)
* [OWASP Top 10 Application Security Risks](https://www.owasp.org/index.php/Category:OWASP_Top_Ten_Project)
* <a target="_blank" href="https://www.amazon.com/gp/product/1420063804/ref=as_li_tl?ie=UTF8&tag=masblog0c-20&camp=1789&creative=9325&linkCode=as2&creativeASIN=1420063804&linkId=78d62188804e1a4ec318be21c11b2e06">Security Software Development: Assessing and Managing Security Risks, by Douglas Ashbaugh</a>\*
* <a target="_blank" href="https://www.amazon.com/gp/product/0321356705/ref=as_li_tl?ie=UTF8&tag=masblog0c-20&camp=1789&creative=9325&linkCode=as2&creativeASIN=0321356705&linkId=41035ec6c1a8dab889475358b0afce38">Software Security: Building Security In, by Gary McGraw</a>\*
* [UBC CPEN 442 Introduction to Computer Security](http://courses.ece.ubc.ca/cpen442/syllabus/index.html), taught by Konstantin Beznosov

<p class="post-script">*We are a participant in the Amazon Associates Program, an affiliate advertising program designed to provide a means for us to earn fees by linking to Amazon and affiliated sites.</p>
