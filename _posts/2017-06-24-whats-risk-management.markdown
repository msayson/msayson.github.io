---
layout: post
title:  "What's risk management?"
date:   2017-06-24 19:00:00 -0800
categories: security
---

Risk management is one of the topics covered in the introductory computer security course at UBC, and it's relevant to many other fields including finance, engineering, and project management.

The main idea is simple: when there are many high-value assets, or many risks that may not be easily solved, an effective approach is to identify all of the risks and evaluate their impact and likelihood in order to prioritize them and determine appropriate countermeasures.

This post draws from my notes from Security Software Development: Assessing and Managing Security Risks (Ashbaugh), Software Security: Building Security In (McGraw), and UBC CPEN 442 Introduction to Computer Security (Beznosov).

### An example from Human Resources

In a Human Resources department, risks may include unexpected staff departures, sick leaves, bad hires, and improper workplace behaviour.

For example, suppose we identify a few individuals without which our department would collapse.  If they're engaged in their work but we expect other companies to court them, then we might rate the impact of one of their departures as high and the likelihood as medium.  We've identified a potential point of failure, and can look for ways to improve our organization's robustness.

In parallel to any employee retention strategies, we can move forward by encouraging subject experts to mentor other promising employees, assigning tasks to a more varied set of people so that specialized knowledge spreads across the team, and encouraging basic documentation so that new team members can easily ramp up.

If these measures go into practise, we expect the impact of individual employee departures to shift to a manageable level, decreasing the overall risk of such events.

### Motivation for software security risk analysis

Many modern software applications are web-based and interact with many users and external services.  This wider attack surface increases the potential for vulnerabilities that may be exploited, and security incidents can often have a [high financial cost](https://securityintelligence.com/media/2016-cost-data-breach-study) if they disrupt business operations or impact user data.

Security is of growing importance to businesses of all sizes, as [many attackers are starting to target small businesses](https://www.theguardian.com/small-business-network/2016/feb/08/huge-rise-hack-attacks-cyber-criminals-target-small-businesses) with the perception that they will be a "soft" target.

For large systems, it's often impractical to find and fix every possible vulnerability.  However, it's still possible to track and manage many of the risks.

Moreover, when we have a means for measuring the risk of a given event before and after a safeguard is put into place, we can better judge which safeguards are worth implementing.

### Identifying assets

The first step in any risk analysis is to identify the assets in the system.  These may include physical resources, services, intellectual property, and various types of company and user data.

We can identify assets by brainstorming with team representatives, reviewing organizational documents such as system architecture and data flow diagrams, or referencing lists from similar projects or information security sites.  This doesn't have to take long, and the simple act of recognizing the items of value improves your chances of designing a system that appropriately protects them.

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

Threats are any source of danger to the organization, and can be categorized as business-oriented or system-oriented, or by the nature of the source: human, technical, or environmental.  Threats can be targeted or untargeted, and deliberate or unintentional.

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
{:.small-borderless-table}

Natural disasters are rarely considered, but high potential costs may encourage companies to replicate high-value data in multiple regions.  Financial institutions can't risk losing all their data in case of a hurricane or earthquake, and the same goes for many other major organizations.

### Identifying vulnerabilities

Vulnerabilities are weaknesses in a system that could allow a threat to compromise an asset's confidentiality, integrity, or availability.  Most complex systems have both design flaws and implementation bugs, and the earlier in the development process they're discovered, the easier it is to resolve them.

Companies such as Microsoft and Cigital have reported that over half of their discovered security vulnerabilities have turned out to be design flaws (Software Security, McGraw), so it's worth building security requirements into the design specifications and verifying them early on.

The [IEEE Computer Society’s Center for Secure Design](https://cybersecurity.ieee.org/center-for-secure-design) provides resources on designing secure software and avoiding common design flaws, and organizations such as [OWASP](https://www.owasp.org/index.php/Main_Page) report on the most common web application vulnerabilities.

### Determining risk levels

Once we've identified our system's threats and vulnerabilities, we can cross-reference the two lists to produce applicable threat-vulnerability pairs and their corresponding threat actions.

For example, consider a third party who may listen to network traffic (threat), and an authentication process that transmits user credentials in plain text (vulnerability).  A clear threat action would be for a third party to eavesdrop on user logins, which would give them the credentials of users who log in on the same network.

#### How should we determine the risk level of each threat action?

The impact of a threat action to the business is an important part of our risk level.  How much would the threat action cost the business?  Would the damage be recoverable or not?

Also important is the likelihood of the threat action being carried out.  If there's no motivation for a person to exploit a vulnerability, or the event is highly unlikely to occur, this reduces our risk level.

Common risk assessment methods state risk level as the impact times the likelihood of the threat action.  This rates threat actions by their expected damage per unit of time.

<b>Risk level = Impact X Likelihood</b>

Therefore, a threat action that we expect to cause $1000 of damage/occurrence and occur 1000 times/year will be considered just as important as a once-a-year event that causes $1M of damage.

Either qualitative or quantitative approaches can be used for risk assessments, depending on how much relevant and accurate data is available, and how important precise risk levels are to the business.

Insurance companies manage frequent events that cost a great deal of money, so it's important for them to accurately predict the cost and probability of events that they cover.  They're also in an excellent position to collect accurate data, making quantitative analysis a clear choice for them.

Software companies don't often have the same level of data reporting for security incidents, so it can be difficult to determine the probabilities of many threat actions.  It can also be difficult to determine the value of intangible assets such as user data, intellectual property, and reputation, so qualitative analyses are more often used for software projects.

Below is a simple qualitative risk level table.

| | Low Impact | Medium Impact | High Impact |
| --- | --- | --- | --- |
| <b>Low Likelihood</b> | Low Risk | Low Risk | Medium Risk |
| <b>Medium Likelihood</b> | Low Risk | Medium Risk | High Risk |
| <b>High Likelihood</b> | Medium Risk | High Risk | Critical Risk |
{:.small-bordered-table}

### Conclusion

A typical risk assessment consists of:

* Identifying system assets, threats, and vulnerabilities
* Assessing which threat-vulnerability pairs provide relevant threat actions
* Determining the impact and likelihood of each threat action
* Calculating each threat actions's risk level as impact X likelihood
* Prioritizing work by risk level and monitoring risk levels over time

Determining the impact and likelihood of threat actions can be difficult without accurate data, but qualitative scales can yield ranks that are reasonable for our purpose.

Given a list of threat actions, impacts, and likelihoods, developers can prioritize their efforts based on risk level to the business.  By reassessing risks periodically, organizations can monitor their risk levels and security readiness over time.

Helpful resources:

* [IEEE Computer Society’s Center for Secure Design](https://cybersecurity.ieee.org/center-for-secure-design)
* [OWASP Top 10 Application Security Risks](https://www.owasp.org/index.php/Category:OWASP_Top_Ten_Project)
* <a target="_blank" href="https://www.amazon.com/gp/product/1420063804/ref=as_li_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=1420063804&linkCode=as2&tag=masblog0c-20&linkId=8f7fcccbd311d41a0d308d5f035e3879">Security Software Development: Assessing and Managing Security Risks, by Douglas Ashbaugh</a><img src="//ir-na.amazon-adsystem.com/e/ir?t=masblog0c-20&l=am2&o=1&a=1420063804" width="1" height="1" border="0" alt="" style="border:none !important; margin:0px !important;" />\*
* <a target="_blank" href="https://www.amazon.com/gp/product/0321356705/ref=as_li_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=0321356705&linkCode=as2&tag=masblog0c-20&linkId=274bd8088d023e0632bee5206038ecda">Software Security: Building Security In, by Gary McGraw</a><img src="//ir-na.amazon-adsystem.com/e/ir?t=masblog0c-20&l=am2&o=1&a=0321356705" width="1" height="1" border="0" alt="" style="border:none !important; margin:0px !important;" />\*
* [UBC CPEN 442 Introduction to Computer Security](http://courses.ece.ubc.ca/cpen442/syllabus/index.html), taught by Konstantin Beznosov

<div style="font-size: 14px">*We are a participant in the Amazon Associates Program, an affiliate advertising program designed to provide a means for us to earn fees by linking to Amazon and affiliated sites.</div>
