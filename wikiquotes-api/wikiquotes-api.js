var WikiquoteApi = (function() {

  var wqa = {};

  var API_URL = "https://en.wikiquote.org/w/api.php";

  var defaultMask = [/^[A-Z]( ?- ?[A-Z])?$/];
  
  
  /**
   * Query based on "titles" parameter and return page id.
   * If multiple page ids are returned, choose the first one.
   * Query includes "redirects" option to automatically traverse redirects.
   * All words will be capitalized as this generally yields more consistent results.
   */
  wqa.queryTitles = function(titles, success, error) {
    $.ajax({
      url: API_URL,
      dataType: "jsonp",
      data: {
        format: "json",
        action: "query",
        redirects: "",
        titles: titles
      },

      success: function(result, status) {
        var pages = result.query.pages;
        var pageId = -1;
        for(var p in pages) {
          var page = pages[p];
          // api can return invalid recrods, these are marked as "missing"
          if(!("missing" in page)) {
            pageId = page.pageid;
            break;
          }
        }
        if(pageId > 0) {
          success(pageId);
        } else {
          error("No results");
        }
      },

      error: function(xhr, result, status){
        error("Error processing your query");
      }
    });
  };

  /**
   * Get the sections for a given page.
   * This makes parsing for quotes more manageable.
   * Returns an array of all sections that have headings of a specific format, like a
   * letter of the alphabet or a range of letters, or other user-defined format.
   * Returns the titles that were used
   * in case there is a redirect.
   */
  wqa.getSectionsForPage = function(data, success, error) {
    $.ajax({
      url: API_URL,
      dataType: "jsonp",
            type: 'GET',
      contentType: 'text/plain',
      data: {
        format: "json",
        action: "parse",
        prop: "sections",
        pageid: data.pageId
      },

      success: function(result, status){
        var sectionArray = [];
        var sections = result.parse.sections;
        let size = sections.length;
        let step = 0;
        let sectionsMask = defaultMask;
        
        /* Get user-defined custom masks to check against when iterating
         * through section names on a page */
        if(data.masks && data.masks.length) {
            sectionsMask = [];
            
            data.masks.forEach(function(mask) {
                if(mask && typeof mask === 'string') {
                    let rx = new RegExp(mask);
                    sectionsMask.push(rx);
                }
            });
        }
        
        /* Get only those sections that have headings of a specific format,
         * which can be either user-defined, or alphabetic (defaultMask), like 'A' or 'W-Y' */
        while (step < size) {
            sectionsMask.forEach(function(mask) {
                if(mask.test(sections[step].line)) {
                    sectionArray.push(sections[step].index);
                }
            });                        
            step++;
        }

        if(sectionArray.length === 0) {
          error('Failed to locate a matching section to fetch a quote');
        } else
            success({ titles: result.parse.title, sections: sectionArray });
      },
      error: function(xhr, result, status){
        error("Error getting sections");
      }
    });
  };

  /**
   * Get all quotes for a given section.  Most sections will be of the format:
   * <h3> title </h3>
   * <ul>
   *   <li> 
   *     Quote text
   *     <ul>
   *       <li> additional info on the quote </li>
   *     </ul>
   *   </li>
   * <ul>
   * <ul> next quote etc... </ul>
   *
   * Returns the titles that were used in case there is a redirect.
   */
  wqa.getQuoteFromSection = function(pageId, sectionIndex, success, error) {
    $.ajax({
      url: API_URL,
      dataType: "jsonp",
      data: {
        format: "json",
        action: "parse",
        noimages: "",
        pageid: pageId,
        section: sectionIndex
      },

      success: function(result, status) {          
        var quotes = result.parse.text["*"];
        /* Prevent images from being requested unnecessarily (by removing
         * the src(set) attributes from the html text), when building the jQuery objects below */
        quotes = quotes.replace(/src(set)?=\".*?"/g, '');
        var anchor = result.parse.sections[0].anchor;
        var quoteArray = [] 
        
        // Find top level <li>s only
        var $listItems = $(quotes).children('li');
        
        let size = $listItems.length;
        let randomNum = Math.floor(Math.random() * size);        
        
        
        /*
         * Get text contents of the top-level list items,
         * by iterating through the elements contained within
         * and ignoring the text inside the child nodes that are
         * unordered list items <ul>, because those
         * don't contain the quote itself
         */
        function getTheQuote() {
            var theQuote = [];
            $(this).contents().filter(function() { return this.nodeName != "UL"; }).each(function() {                               
                function getText() {                    
                    if(this.nodeName == "BR")
                        theQuote.push('<br />'); 
                    else if(this.nodeType === 3) {
                        theQuote.push(this.textContent);
                    }
                    else {
                        $(this).contents().each(function() {
                            getText.call(this);
                        });
                    }
                }                
                getText.call(this);              
            });
            quoteArray.push(theQuote.join(''));
        }      
        
        // Select a random list item and extract the quote from it
        getTheQuote.call($listItems.eq(randomNum));

        success({ titles: result.parse.title, quotes: quoteArray, anchor: anchor });
      },
      error: function(xhr, result, status){
        error("Error getting quotes");
      }
    });
  };
  
  /**
   * Get Wikipedia page for specific section
   * Usually section 0 includes personal Wikipedia page link
   */
  wqa.getWikiForSection = function(title, pageId, sec, success, error) {
    $.ajax({
      url: API_URL,
      dataType: "jsonp",
      data: {
        format: "json",
        action: "parse",
        noimages: "",
        pageid: pageId,
        section: sec
      },

      success: function(result, status){
		
        var wikilink;
		console.log('what is iwlink:'+result.parse.iwlinks);
		var iwl = result.parse.iwlinks;
		for(var i=0; i<(iwl).length; i++){
			var obj = iwl[i];
			if((obj["*"]).indexOf(title) != -1){
				 wikilink = obj.url;
			}
		}
        success(wikilink);
      },
      error: function(xhr, result, status){
        error("Error getting quotes");
      }
    });
  };
  /**
   * Search using opensearch api.  Returns an array of search results.
   */
  wqa.openSearch = function(titles, success, error) {
    $.ajax({
      url: API_URL,
      dataType: "jsonp",
      data: {
        format: "json",
        action: "opensearch",
        namespace: 0,
        suggest: "",
        search: titles
      },

      success: function(result, status){
        success(result[1]);
      },
      error: function(xhr, result, status){
        error("Error with opensearch for " + titles);
      }
    });
  };

  /**
   * Query Wikiquotes API based on a given title to get it's page id
   * and pass that to the next function, which chooses a random
   * quote from a random section on that page
   */
  wqa.getRandomQuote = function(data, success, error) {

    var errorFunction = function(msg) {
      error(msg);
    };
    
    wqa.queryTitles(data.title, function(pageId) { wqa.getRandomQuoteByPageID({pageId: pageId, masks: data.masks}, success, error); } , errorFunction);
  };  
  
  /*
   * Gets quotes from a page by first getting sections that have a heading conforming to a 
   * user-defined mask (if any). Otherwise, defaultMask is used to check
   * for headings. Randomly chooses one of these sections, then randomly chooses and extracts a quote,
   * which it passes to the callback function, together with the page title and the quote anchor on the page
   */
  wqa.getRandomQuoteByPageID = function(data, success, error) {
      
    var errorFunction = function(msg) {
      error(msg);
    };

    var getQuote = function(pageId, sections) {
      var randomNum = Math.floor(Math.random()*sections.sections.length);
      wqa.getQuoteFromSection(pageId, sections.sections[randomNum], function(quotes) {
          success({ titles: quotes.titles, quote: quotes.quotes[0], anchor: quotes.anchor });
    }, errorFunction);
    };

    var getSections = function(data) {
      wqa.getSectionsForPage(data, function(sections) { getQuote(data.pageId, sections); }, errorFunction);
    };

    getSections(data);
  }

  /**
   * Capitalize the first letter of each word
   */
  wqa.capitalizeString = function(input) {
    var inputArray = input.split(' ');
    var output = [];
    for(s in inputArray) {
      output.push(inputArray[s].charAt(0).toUpperCase() + inputArray[s].slice(1));
    }
    return output.join(' ');
  };

  return wqa;
}());
