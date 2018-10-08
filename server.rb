
require "open-uri"
require "json"
require "./timeedit.rb"

$places = {}
open("https://www.kth.se/api/places/v2/places", "rb") do |stream|
    $places = JSON.parse(stream.read)
    #puts @places.find{|x| x["name"] == "4V2Röd"}
end

require "sinatra"

get "/" do
    send_file("vue.html")
end

get "/correcturl" do
    getCorrectUrl(params["url"])
end

get "/places" do
    content_type :json
    $places.to_json
end