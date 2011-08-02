Feature: Listing users
  In order to see a list of users
  As a regular person
  I want to be able to see a nice list of users

  @javascript
  Scenario: I surf to the homepage and there are only 1 page of users
    Given 9 noladex users exist
    And I am on the users page
    Then I should see "Find people who"
    And I should see "User 1"
  
  @javascript
  Scenario: I surf to the homepage and there 2 pages of users
    Given 18 noladex users exist
    And I am on the users page
    Then I should see "Find people who"
    And I should only see 9 people
  
  @javascript
  Scenario: I surf to the homepage and there 2 pages of users and I start scrolling
    Given 18 noladex users exist
    And I am on the users page
    Then I should see "Find people who"
    And I should only see 9 people    
    Then scroll to the bottom of the page
    And I should only see 18 people