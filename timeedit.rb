#URL = "https://cloud.timeedit.net/kth/web/public01/ri10u387053Z5lQ535679Q05yZ075WZ1Q3Y68Q5Q10274.html"

require "open-uri"
require "oga"
require "json"

def getHtml(url)
    html = ""
    open(url, "rb") do |stream|
        html = stream.read
    end
    html.gsub!(/\000/, '')
    doc = Oga.parse_html(html)
    return doc, html
end

#takes any timeedit url, jumps to current date, then forward one week and back one week
#in order to get the correct week url
def getCorrectUrl(url)
    doc, html = getHtml(url)
    #week = Date.today.cweek
    #urlWeek = doc.at_css(".weekDayHeaderFirst")
    #urlWeek = urlWeek.text.gsub("v ", "")
    nowUrl = doc.at_css(".btrFirst")
    if nowUrl.name == "a" #it is not a "now" url
        url = nowUrl.attribute("href").value
        doc, html = getHtml(url)
    end
    nextWeek = doc.at_css(".btrRight").parent.attribute("href").value
    doc, html = getHtml(nextWeek)
    correctUrl = doc.at_css(".btrLeft").parent.attribute("href").value
    correctUrl.gsub!(".html", ".json")
    return correctUrl
end

def getContent(url)
    json = ""
    open(url, "rb") do |stream|
        json = stream.read
    end
    return JSON.parse(json)
end
#getCorrectUrl(URL)
#puts getContent(getCorrectUrl(URL)).to_json