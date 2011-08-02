FactoryGirl.define do
  
  factory :category do 
    name 'teach'
  end

  factory :mission do 
    statement 'stuff'
    category_id 1
  end

  factory :user do
    name 'Dexter Morgan'
    password 'iloveknives'
    email 'dexter@morgan.com'
    avatar File.open(File.join('db', 'fixtures', 'kitten.jpeg'))
    url1 'google.com'
    url2 'google.com'
    url3 'google.com'
    after_build do |user|
      user.missions << FactoryGirl.build(:mission, :user => user)
    end
  end

end
