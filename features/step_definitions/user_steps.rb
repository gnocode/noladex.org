Given /^(\d+) noladex users exist$/ do |user_count|
  ['build', 'teach'].each do |cat|
    FactoryGirl.create(:category, :name => cat)
  end
  user_count.to_i.times do |idx|
    FactoryGirl.create(:user, {:name => "User #{idx}", :email => "user#{idx}@example.com"})
  end
end

Then /^I should only see (\d+) people$/ do |count|
  page.has_xpath?('.//div[@class="person"]', :count => 27)
end

Then /^scroll to the bottom of the page$/ do
  visit "#about-us"
end