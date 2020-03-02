class SearchResult
	constructor: (data) ->
		@title = data.title
		@link = data.link
		@extras = data
	
	toHtml: -> "<a href='#{@link}'>#{@title}</a>"
	toJson: -> JSON.stringify @extras

class GoogleSearchResult extends SearchResult
	constructor: (data) ->
		super data
		@content = @extras.content
	toHtml: ->
		"#{super} <div class='snippet'>#{@content}</div>"
			
class TwitterSearchResult extends SearchResult
	constructor: (data) ->
		super data
		@source = @extras.from_user
		@link = "http://twitter.com/#{@source}/status/#{@extras.id_str}"
		@title = @extras.text
	toHtml: ->
		"<a href='http://twitter.com/#{@source}'>@#{@source}</a>: #{super}"

class CombinedSearch
	search: (keyword, callback) ->
		xhr = new XMLHttpRequest
		xhr.open "GET", "/doSearch?q=#{encodeURI(keyword)}", true
		xhr.onreadystatechange = ->
			if xhr.readyState is 4
				if xhr.status is 200
					response = JSON.parse xhr.responseText
					results = 
						google: response.google.map (result) -> 
							new GoogleSearchResult result
						twitter: response.twitter.map (result) -> 
							new TwitterSearchResult result
					callback results
		xhr.send null

@doSearch = ->
	$ = (id) -> document.getElementById(id)
	kw = $("searchQuery").value
	appender = (id, data) ->
		data.forEach (x) -> 
			$(id).innerHTML += "<p>#{x.toHtml()}</p>"
	ms = new CombinedSearch
	ms.search kw, (results) ->
		appender("gr", results.google)
		appender("tr", results.twitter)

