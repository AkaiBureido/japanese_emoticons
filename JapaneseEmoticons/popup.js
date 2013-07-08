debugmode = true;

// Version tracking has started with 1.1.7
if(chrome.app.getDetails().version != localStorage.currentVersion){
  //This is a place for migrations
  //As of 1.1.7 keys:
  // - readTheTutorial # indicates the user have thead the tutorial


  // localStorage.clear();
}

//TODO: Implement tutorial. [done]
//TODO: Implement tutorial. In an MVC way. [done]
//TODO: Bubble up emoticons if they are often used. 
//      10 click is equal to 0.1 weight in shuffling.
//TODO: Add a settings page to allow to opt into bubble up.

String.prototype.capitalize = function() {
    return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};

Array.prototype.rotate = (function() {
    return function(inc) {
        for (var l = this.length, inc = (Math.abs(inc) >= l && (inc %= l), inc < 0 && (inc += l), inc), i, x; inc; inc = (Math.ceil(l / inc) - 1) * inc - l + (l = inc))
        for (i = l; i > inc; x = this[--i], this[i] = this[i - inc], this[i - inc] = x);
        return this;
    };
})();

var localisation = {}
localisation['htmlstrings'] = {
  'en': {
    'about_page': 
         '<p>'
      +    'This extension puts the whole collection of JapaneseEmoticons.net under your fingertips.'
      +  '</p>'
      +  '<p>'
      +    'To use it &mdash; simply go through the categories, click on the emoji you want and it will be copied to your clipboard. </br>'
      +    '</br>'
      +    'If you want, you can find more info on my blog: <a target="_blank" href="http://nonlogicaldev.tumblr.com/">NonLogicalDev</a>'
      +  '</p>'
      +  '<hr/>'
      +  '<footer>'
      +    '<h5>With kind kudos to <a target="_blank" href="http://www.japaneseemoticons.net">JapaneseEmoticons.net</a> for its amazing selection of Japanese emoticons.</h5>'
      +    '<h4>by <a target="_blank" href="https://github.com/AkaiBureido">Akaibureido</a></h4>'
      +  '</footer>',

    'tutorial_popup':
          'Hello my dearest new user! </br>'
      +   'Thank you for giving this extension a try. </br>'
      +   'Using it is very simple, try it:'
      +   '<ul>'
      +     '<li> Click on the <strong>Positive Feelings</strong> category </li>'
      +     '<li> Then click on <strong>Happy or Joyfull</strong> </li>'
      +     '<li> Finally, click on any emoji you like and it will be automatically copied straight into the clipboard </li>'
      +     '<li> Now go anywhere you want the emoji and simply paste</li>'
      +   '</ul>'
      +   'If you want, you can find more info on my blog: <a target="_blank" href="http://nonlogicaldev.tumblr.com/">NonLogicalDev</a><a href="#"></a>'
  },
  'jp': {
    'about_page': '',
    'tutorial_popup': ''
  }
}

// localisation['category_names'] = {
//   'jp': {
//      
//   }
// }

var htmlstrings = localisation['htmlstrings']['en'];

app = new JEViewController();
window.onready = app.awakeFromLoad()

function JEViewController() {
  // viewTitle, backButton, viewContainer, model
  this.awakeFromLoad = function() {
    this.$viewTitle     = document.querySelector('#topbar .view-title');
    this.$backButton    = document.querySelector('#topbar .button');
    this.$viewContainer = document.querySelector('#view-container');
    this.$popup         = document.querySelector('#popup')

    this.Model = new JEModel();
    this.Model.inilialise( this.awakeFromModelLoad.bind(this) );

    this.ListView      = new JEListView( this.$viewContainer );
    this.TableView     = new JETableView( this.$viewContainer );
    this.AboutView     = new JEAboutView( this.$viewContainer );
  }

  this.awakeFromModelLoad = function() {
    console.log("model ready");
    this.clearPopup();
   
    if(localStorage.readTheTutorial != 'true') {
      this.displayPopup(htmlstrings['tutorial_popup'], 'tutorial', function(){
        this.clearPopup();
        localStorage.readTheTutorial = true;
      }.bind(this));
    }
    
    this.switchToCategoriesView();
  }

  this.switchToAboutView = function () {
    _gaq.push(['_trackEvent', 'about_page', 'viewed']);
    
    this.setTitle( "JapaneseEmoticons" );
    this.setBackButton( function(){ this.switchToCategoriesView() }.bind(this));
    this.clearViewContainer();

    this.AboutView.render();
  }

  this.switchToCategoriesView = function () {
    this.setTitle("Categories");
    this.setAboutButton( function(){ this.switchToAboutView() }.bind(this));
    this.clearViewContainer();

    categories = this.Model.getCategories()
    console.log(categories)
    for (var i=0; i < categories.length; i++) {
      categories[i] = {
        "string": this._sym_to_str(categories[i]),
        "selector": categories[i]
      }
    }

    this.ListView.render(categories, this, function(selector, e) {
      this.switchToSubCategoryView(selector);
    });
  }

  this.switchToSubCategoryView = function (subcategoryName) {
    _gaq.push(['_trackEvent', subcategoryName, 'viewed']);
    
    this.setTitle( this._sym_to_str(subcategoryName) );
    this.setBackButton( function(){ this.switchToCategoriesView() }.bind(this));
    this.clearViewContainer();

    categories = this.Model.getSubCategories(subcategoryName);
    console.log(categories)
    for (var i=0; i < categories.length; i++) {
      categories[i] = {
        "string": this._sym_to_str(categories[i]),
        "selector": subcategoryName + '/' + categories[i]
      }
    }

    this.ListView.render( categories, this, function (selector, e) {
      path = selector.split('/');
      console.log(path)
      
      this.switchToEmoticonTableView(path[0],path[1]);
    });
  }

  this.switchToEmoticonTableView = function (categoryName, subcategoryName) {
    _gaq.push(['_trackEvent', categoryName+'/'+subcategoryName, 'viewed']);
    
    this.setTitle( this._sym_to_str(subcategoryName) );
    this.setBackButton( function(e){
      this.switchToSubCategoryView(categoryName);
    }.bind(this));
    this.clearViewContainer();
    
    emoticons = this.Model.getEmoticonList(path[0],path[1]);
   
    // TODO: Find a way to delegate cat/subcat to the callback.
    this.TableView.render(emoticons, this, function(smiley, e) {
      console.log(smiley);
      this.copyToClipboard(smiley);
      _gaq.push(['_trackEvent', this.$viewTitle.textContent.replace(':','').replace(/ /g, '_').toLowerCase() + '/' + smiley, 'copied']);
    });
  }

  this.copyToClipboard = function(newText) {
    var copyDiv = document.createElement('div');
    copyDiv.contentEditable = true;
    document.body.appendChild(copyDiv);
    copyDiv.innerHTML = newText;
    copyDiv.unselectable = "off";
    copyDiv.focus();
    document.execCommand('SelectAll');
    document.execCommand("Copy", false, null);
    document.body.removeChild(copyDiv);
  }

  this._sym_to_str = function(sym) {
    sym = sym.replace(/_/g, ' ');
    sym = sym.capitalize();
    return sym;
  }

  this.clearViewContainer = function() {
    this.$viewContainer.innerHTML = "";
  }

  this.displayPopup = function(content, category, dismiss_callback) {
    _gaq.push(['_trackEvent', 'popup/' + category, 'diplayed']);

    message       = this.$popup.querySelector('.message');
    dismissButton = this.$popup.querySelector('.dismiss');

    message.innerHTML = content;

    if(this._prevPopupDismissCallback) {
      dismissButton.addEventListener('click', dismiss_callback );
    }

    dismissButton.addEventListener('click', dismiss_callback );

    this._prevPopupDismissCallback = dismiss_callback;

    this.$popup.style.display = "";
  }

  this.clearPopup = function() {
    _gaq.push(['_trackEvent', 'popup', 'cleared']);
  
    message       = this.$popup.querySelector('.message');
    
    message.innerHTML = "";
    this.$popup.style.display = "none";
  }

  this.setTitle = function(newTitle) {
    this.$viewTitle.innerHTML = newTitle + ':';
  }
  
  this.setAboutButton = function (callback) {

    this.$backButton.innerHTML = "?";
    
    if(this._prevBackButtonCallback) {
      this.$backButton.removeEventListener('click', this._prevBackButtonCallback)
    }

    this.$backButton.addEventListener('click', callback);
    
    this._prevBackButtonCallback = callback;
  }
  
  this.setBackButton = function (callback) {
    
    this.$backButton.innerHTML = "Back";
    
    if(this._prevBackButtonCallback) {
      this.$backButton.removeEventListener('click', this._prevBackButtonCallback)
    }

    this.$backButton.addEventListener('click', callback);
    
    this._prevBackButtonCallback = callback;
  }
}

function JEAboutView(parent) {
  this._defaultTemplate = function() {
    about = document.createElement('div');
    about.setAttribute('id', 'about');
    about.innerHTML = htmlstrings['about_page'];
    return about;
  }

  this.render = function() {
    view = this._defaultTemplate();
    parent.appendChild(view);
  }
}

function JEListView(parent) {
  this._defaultTemplate = function() {
    // <ul class='emotes-cat'></ul>
    template = document.createElement('ul');
    template.setAttribute('id', 'emotes-cat');
    return template
  }

  this.render = function(hash, context, callback) {
    view = this._defaultTemplate();
    
    for (var i=0; i < hash.length; i++) {
      // <li> hash[i] </li>
      listItem = document.createElement('li');
      listItem.innerHTML = hash[i].string;
      
      if(callback) {
        listItem.addEventListener('click', callback.bind(context, hash[i].selector))
      }

      view.appendChild(listItem);
    }

    parent.appendChild(view);
  }
}

function JETableView(parent) {
  this._defaultTemplate = function() {
    // <table id='emotes'></table>
    template = document.createElement('table');
    template.setAttribute('id', 'emotes');
    return template;
  }

  this.render = function(hash, context, callback) {
    view = this._defaultTemplate();

    groups = this._determineColspan(hash);
    console.log(groups);

    rows = this._prepareRows(groups);

    for (var i=0; i < rows.length; i++) {
      // <tr> </tr>
      row = document.createElement('tr');
      for(var j=0; j < rows[i].length; j++) {
        // <td colspan=#{rows[i].colspan} > rows[i].text </td>
        cell = document.createElement('td');
        cell.setAttribute('colspan', rows[i][j].colspan);
        cell.innerHTML = rows[i][j].text;

        if(callback) {
          cell.addEventListener('click', callback.bind(context, rows[i][j].text))
        }

        row.appendChild(cell);
      }
      view.appendChild(row);
    }

    parent.appendChild(view)
  }

  this._prepareRows = function(groups) {
    // Goal - aesthetically break up the smileys into rows
    // groups[0] - emoticons that fit in one cell
    // groups[1] - emoticons that fit in two cells
    // groups[2] - emoticons that fit in three cells
    // groups[3] - emoticons that fit in four cells

    rows = [];


    // Algorithm:
    // First add all the 4 cell smileys
    while(groups[3].length != 0) {
      rows.unshift([
          {'text': groups[3].pop(), 'colspan': 4}
      ]);
    };
    
    // Second add all of the 2 cell smileys + 2 cell smileys
    // Or think, think, think, think
    
    // Goal - we want to somewhat evenly distribute 
    // [4](1 cell) rows
    // [2](2 cell) rows
    // [2](1 cell) + [1](2 cell) rows
    // [1](3 cell) + [1](1 cell) rows
    
    // Lets forget that we have 3 cell smileys for now
    // Lets see if we have any 2 cell widows
    oneCellsLeft = groups[0];
    spareTwoCells = groups[1].length - Math.floor(groups[1].length/2) * 2;
    savedOneCells = [];
    if(spareTwoCells) {
      // If we have a 2 cell spare it would be brilliant to have two 1 cells
      if(oneCellsLeft >= 2) {
          rows.unshift([
              {'text': groups[1].pop(), 'colspan': 2},
              {'text': groups[0].pop(), 'colspan': 1},
              {'text': groups[0].pop(), 'colspan': 1}
          ]);
      // If we are not so very lucky then we'll have to do with stretching widow a bit
      } else if(oneCellsLeft == 1) {
          rows.unshift([
              {'text': groups[1].pop(), 'colspan': 3},
              {'text': groups[0].pop(), 'colspan': 1},
          ]);
      // If we are downright miserable, the best we can do is stretch the widow
      } else {
          rows.unshift([
              {'text': groups[1].pop(), 'colspan': 4}
          ]);
      }
    }

    // We have gotten rid of 2 cell widows, now its party time provided we have some 1 cells left 
    oneCellsLeft = groups[0];
    if(oneCellsLeft) {
      // If we are lucky then lets think a litle more
      // Lets remind ourselved what we are actually trying to do
      // Goal - we want to somewhat evenly distribute 
      // [4](1 cell) rows
      // [2](2 cell) rows
      // [2](1 cell) + [1](2 cell) rows
      // [1](3 cell) + [1](1 cell) rows

      // Start with simple:
      // [1](3 cell) + [1](1 cell) rows
      while(groups[2].length != 0) {
        // If we have 1 cell smileys add one after the 3 cell smiley
        if(groups[0].length != 0) {
          rows.unshift([
              {'text': groups[2].pop(), 'colspan': 3},
              {'text': groups[0].pop(), 'colspan': 1},
          ]);
        // If we dont make smiley 4 cells wide
        } else {
          rows.unshift([
              {'text': groups[2].pop(), 'colspan': 4},
          ]);
        }
      }

      //Dump savedOneCells back in
      destiny = 0;
      canBalance = true;
      while(groups[1].length != 0) {
        if(destiny % 3 == 0 && canBalance) {
          if(groups[0].length >= 4 && groups[1].length >= 2) {
            rows.unshift([
                {'text': groups[1].pop(), 'colspan': 2},
                {'text': groups[0].pop(), 'colspan': 1},
                {'text': groups[0].pop(), 'colspan': 1}
            ],[
                {'text': groups[1].pop(), 'colspan': 2},
                {'text': groups[0].pop(), 'colspan': 1},
                {'text': groups[0].pop(), 'colspan': 1}
            ]);
          } else {
            canBalance = false;
          }
        } else {
            rows.unshift([
                {'text': groups[1].pop(), 'colspan': 2},
                {'text': groups[1].pop(), 'colspan': 2}
            ]);
        }

        destiny++;
      }

    } else {
      // If we are unlucky we will just stack them side by side
      while(groups[1].length != 0) {
        rows.unshift([
            {'text': groups[1].pop(), 'colspan': 3},
            {'text': groups[0].pop(), 'colspan': 1},
        ]);
      }
    }

    // spareOneCells = groups[0].length - Math.floor(groups[0].length/4) * 4;
    // // Lets pretend we have achive equilibrium
    // // I am not sure how to do it ^^
    // for(var i=0; i < spareOneCells; i++) {
    //   savedOneCells.push(groups[0].shift())
    // };
    

    // Forth if there are any 1 cell smileys left display them normally
    while(groups[0].length != 0) {
      if(groups[0].length >= 4) {
        rows.unshift([
            {'text': groups[0].pop(), 'colspan': 1},
            {'text': groups[0].pop(), 'colspan': 1},
            {'text': groups[0].pop(), 'colspan': 1},
            {'text': groups[0].pop(), 'colspan': 1}
        ]);
      // exept if there are widows at the end
      // If 3 widows let last one take two colums
      } else if(groups[0].length == 3) {
        rows.unshift([
            {'text': groups[0].pop(), 'colspan': 1},
            {'text': groups[0].pop(), 'colspan': 1},
            {'text': groups[0].pop(), 'colspan': 2}
        ]);
      // If 2 widows let them both take 2 columns
      } else if(groups[0].length == 2) {
        rows.unshift([
            {'text': groups[0].pop(), 'colspan': 2},
            {'text': groups[0].pop(), 'colspan': 2}
        ]);
      // If 1 widow let it take 4 columns
      } else if(groups[0].length == 1) {
        rows.unshift([
            {'text': groups[0].pop(), 'colspan': 4}
        ]);
      }
    }

    // For extra eye candy rotate each array by curRow
    for (var i=0; i < rows.length; i++) {
      rows[i].rotate(i);
    };

    return rows;
  }

  this._spareOneCells = function(groups) {
    // Ammount of one cells that will make table unbalanced
    spareOneCells = groups[0].length - Math.floor(groups[0].length/4) * 4;
    return spareOneCells;
  }

  this._spareTwoCells = function(groups) {
    // Ammount of two cells that will make table unbalanced
    spareTwoCells = groups[1].length - Math.floor(groups[1].length/2) * 2;
    return spareTwoCells;
  }

  this._determineColspan = function(hash) {
    faketable = this._defaultTemplate();
    row = document.createElement('tr');
    cell = document.createElement('td');
    row.appendChild(document.createElement('td'));
    row.appendChild(document.createElement('td'));
    row.appendChild(document.createElement('td'));
    row.appendChild(cell);
    faketable.appendChild(row);
    parent.appendChild(faketable);

    cellWidth = cell.clientWidth;

    // Breaking up into 4 groups
    groups = []
    groups[0] = [] // - emoticons that fit in one cell
    groups[1] = [] // - emoticons that fit in two cells
    groups[2] = [] // - emoticons that fit in three cells
    groups[3] = [] // - emoticons that fit in four cells
    
    for(var i=0; i < hash.length; i++) {
      metrics = this._calculateTextWidth(hash[i], cell);
      if(metrics[1] < (cellWidth - 4)) {
        groups[0].push(hash[i]);
      } else if(metrics[1] < (cellWidth*2 - 5)) {
        groups[1].push(hash[i]);
      } else if(metrics[1] < (cellWidth*3 - 5)) {
        groups[2].push(hash[i]);
      } else if(metrics[1] < (cellWidth*4 - 5)) {
        groups[3].push(hash[i]);
      }
    }

    parent.removeChild(faketable);
    return groups;
  }

  this._calculateTextWidth = function(string, parent) {
    var container = document.createElement('span')
    container.setAttribute('style', 'position: absolute; visibility: hidden; height: auto; width: auto;')

    parent.appendChild(container)

    var text = document.createTextNode(string)
    container.appendChild(text)

    var metrics = [ 
      (container.clientHeight + 1),
      (container.clientWidth + 1)
    ]

    parent.removeChild(container)

    return metrics
  }
}

function JEModel() {
  this._collection = '';

  this.inilialise = function(loadCallback) {
    this._loadCallback = loadCallback
    var req = new XMLHttpRequest();
    req.onload = this._parse.bind(this);
    req.open("get", chrome.extension.getURL("resourses/emoticons.json"), true);
    req.send();
  }

  this._parse = function(e) {
    this._collection = JSON.parse(e.target.responseText);
    if(this._loadCallback) {
      this._loadCallback();
    }
  }

  this.getCategories = function() {
    return Object.keys(this._collection)
  }

  this.getSubCategories = function(category) {
    return Object.keys(this._collection[category])
  }

  this.getEmoticonList = function(superCategory, category) {
    if(this._collection[superCategory]) {
      return this._collection[superCategory][category]['list']
    } else {
      return
    }
  }
}

// Yes... Lame but can't help it... 気になります！
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-42243080-2']);
_gaq.push(['_trackPageview']);

(function() {
  if(!debugmode) {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  }
})();

localStorage.currentVersion = chrome.app.getDetails().version
