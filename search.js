(function() {
  var CombinedSearch, GoogleSearchResult, MockSearch, SearchResult, TwitterSearchResult;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  SearchResult = (function() {
    function SearchResult(data) {
      this.title = data.title;
      this.link = data.link;
      this.extras = data;
    }
    SearchResult.prototype.toHtml = function() {
      return "<a href='" + this.link + "'>" + this.title + "</a>";
    };
    SearchResult.prototype.toJson = function() {
      return JSON.stringify(this.extras);
    };
    return SearchResult;
  })();
  GoogleSearchResult = (function() {
    __extends(GoogleSearchResult, SearchResult);
    function GoogleSearchResult(data) {
      GoogleSearchResult.__super__.constructor.call(this, data);
      this.content = this.extras.content;
    }
    GoogleSearchResult.prototype.toHtml = function() {
      return "" + GoogleSearchResult.__super__.toHtml.apply(this, arguments) + " <div class='snippet'>" + this.content + "</div>";
    };
    return GoogleSearchResult;
  })();
  TwitterSearchResult = (function() {
    __extends(TwitterSearchResult, SearchResult);
    function TwitterSearchResult(data) {
      TwitterSearchResult.__super__.constructor.call(this, data);
      this.source = this.extras.from_user;
      this.link = "http://twitter.com/" + this.source + "/status/" + this.extras.id_str;
      this.title = this.extras.text;
    }
    TwitterSearchResult.prototype.toHtml = function() {
      return "<a href='http://twitter.com/" + this.source + "'>@" + this.source + "</a>: " + TwitterSearchResult.__super__.toHtml.apply(this, arguments);
    };
    return TwitterSearchResult;
  })();
  CombinedSearch = (function() {
    function CombinedSearch() {}
    CombinedSearch.prototype.search = function(keyword, callback) {
      var xhr;
      xhr = new XMLHttpRequest;
      xhr.open("GET", "/doSearch?q=" + (encodeURI(keyword)), true);
      xhr.onreadystatechange = function() {
        var response, results;
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            response = JSON.parse(xhr.responseText);
            results = {
              google: response.google.map(function(result) {
                return new GoogleSearchResult(result);
              }),
              twitter: response.twitter.map(function(result) {
                return new TwitterSearchResult(result);
              })
            };
            return callback(results);
          }
        }
      };
      return xhr.send(null);
    };
    return CombinedSearch;
  })();
  this.doSearch = function() {
    var $, appender, kw, ms;
    $ = function(id) {
      return document.getElementById(id);
    };
    kw = $("searchQuery").value;
    appender = function(id, data) {
      return data.forEach(function(x) {
        return $(id).innerHTML += "<p>" + (x.toHtml()) + "</p>";
      });
    };
    ms = new CombinedSearch;
    return ms.search(kw, function(results) {
      appender("gr", results.google);
      return appender("tr", results.twitter);
    });
  };
}).call(this);
