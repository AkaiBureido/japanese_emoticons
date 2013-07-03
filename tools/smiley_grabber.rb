require 'nokogiri'
require 'net/http'

url_base = URI('http://www.japaneseemoticons.net/')

raw_html = File.open('menu.html').read()
doc = Nokogiri.parse(raw_html)

categories = {}
doc.xpath('/ul/li').each do |element|
  category = (element.xpath('./a').first[:title])
             .downcase.gsub(' ', '_').to_sym
  
  categories[category] = {}
  element.xpath('./ul/li').each do |sub_element|
    target = sub_element.xpath('./a').first


    sub_cat_name = (target.text).downcase.gsub(' ', '_').to_sym
    url          = target[:href]

    categories[category][sub_cat_name] = {
      url: url
    }
  end
end

categories.each_pair do |category, val|
  val.each do |sub_cat, sub_val|
    target_url = URI(sub_val[:url])
    
    raw_html = Net::HTTP.get(target_url)
    puts "Processing: #{category}/#{sub_cat} [#{sub_val[:url]}]"
    doc = Nokogiri.parse(raw_html) 

    table_body = doc.xpath('//*[@id="content"]/div/div/table/tbody').first

    if table_body.nil?
      puts "Can't Process: #{category}/#{sub_cat} [#{sub_val[:url]}]"
    else
      smileys = []
      table_body.xpath('./tr/td').each do |smiley|
        smileys << smiley.text
      end

      categories[category][sub_cat][:list] = smileys
    end
  end
end

output = File.open("emoticons.json", "w")
output.write(categories.to_json)
output.close
