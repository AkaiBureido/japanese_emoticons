window.$ = document.querySelectorAll.bind(document);
window.$$ = document.querySelector.bind(document);

String.prototype.capitalize = function() {
    return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};

app = new JEViewController();
window.onready = app.awakeFromLoad()

function JEViewController() {
  // viewTitle, backButton, viewContainer, model
  this.awakeFromLoad = function() {
    this.$viewTitle = document.querySelector('#topbar .view-title');
    this.$backButton = document.querySelector('#topbar .back-button');
    this.$viewContainer = document.querySelector('#view-container');

    this.Model = new JEModel();
    this.Model.inilialise( this.awakeFromModelLoad.bind(this) );

    this.ListView = new JEListView( this.$viewContainer );
  }

  this.awakeFromModelLoad = function() {
    console.log("model ready");
    this.switchToCategoriesView();
  }

  this.switchToCategoriesView = function () {
    this.setTitle("Categories");
    this.disableBackButton();
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
      this.switchToSubCategoryView(selector)
    });
  }

  this.switchToSubCategoryView = function (subcategoryName) {
    this.setTitle( this._sym_to_str(subcategoryName) );
    this.setBackButton( function(){ this.switchToCategoriesView() }.bind(this));
    this.clearViewContainer();

    categories = this.Model.getSubCategories(subcategoryName)
    console.log(categories)
    for (var i=0; i < categories.length; i++) {
      categories[i] = {
        "string": this._sym_to_str(categories[i]),
        "selector": subcategoryName + '/' + categories[i]
      }
    }

    this.ListView.render( categories, this, function (selector, e) {
      console.log(selector.split('/'))
    });
  }

  this._sym_to_str = function(sym) {
    sym = sym.replace(/_/g, ' ');
    sym = sym.capitalize();
    return sym;
  }

  this.clearViewContainer = function() {
    this.$viewContainer.innerHTML = "";
  }

  this.setTitle = function(newTitle) {
    this.$viewTitle.innerHTML = newTitle + ':';
  }
  
  this.disableBackButton = function () {
    this.$backButton.style.visibility = "hidden";
  }
  
  this.setBackButton = function (callback) {
    this.$backButton.style.visibility = "visible";
    this.$backButton.addEventListener('click', callback);
  }
}

function JEListView(parent) {
  this._defaultTemplate = function () {
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

// var JapaneseEmoticons = {
//   collection: "",
//   collectionPresent: "",
//   
//   inilialise: function() {
//     var req = new XMLHttpRequest();
//     req.onload = this.parseEmoticons.bind(this);
//     req.open("get", chrome.extension.getURL("emoticons.json"), true);
//     req.send();
//   },
// 
//   buildMENU: function(category) {
//     var table = document.getElementById('emotes')
//   },
// 
//   insertTextAtCarret: function(newText) {
//     document.activeElement.setRangeText("(^_^)")
//   },
// 
//   parseEmoticons: function(e) {
//     this.collection = JSON.parse(e.target.responseText)
//     this.buildMENU()
//   },
//   
//   // Utility functions
//   getCategories: function() {
//     return Object.keys(this.collection)
//   },
// 
//   getSubCategories: function(category) {
//     return Object.keys(this.collection[category])
//   },
// 
//   getEmoticonList: function(superCategory, category) {
//     if(this.collection[superCategory]) {
//       return this.collection[superCategory][category]['list']
//     } else {
//       return
//     }
//   },
// 
//   calculateTextWidth: function(string, parent) {
//     var container = document.createElement('div')
//     container.setAttribute('style', 'position: absolute; visibility: hidden; height: auto; width: auto;')
// 
//     parent.appendChild(container)
// 
//     var text = document.createTextNode(string)
//     container.appendChild(text)
// 
//     var metrics = [ 
//       (container.clientHeight + 1),
//       (container.clientWidth + 1)
//     ]
// 
//     parent.removeChild(container)
// 
//     return metrics
//   }
// }



// a = {}
// 
// function reqListener () {
//   a = this.responseText
// };
// 
// var oReq = new XMLHttpRequest();
// oReq.onload = reqListener;
// oReq.open("get", chrome.extension.getURL("emoticons.json"), true);
// oReq.send();
