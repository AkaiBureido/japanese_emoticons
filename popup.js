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
    this.TableView = new JETableView( this.$viewContainer );
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
      
      this.switchToEmoticonTableView(path[0],path[1])
    });
  }

  this.switchToEmoticonTableView = function (categoryName, subcategoryName) {
    this.setTitle( this._sym_to_str(subcategoryName) );
    this.setBackButton( function(e){
      this.switchToSubCategoryView(categoryName);
    }.bind(this));
    this.clearViewContainer();
    
    emoticons = this.Model.getEmoticonList(path[0],path[1]);
    
    this.TableView.render(emoticons, this, function(smiley, e) {
      console.log(smiley);
      this.copyToClipboard(smiley);
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

  this.setTitle = function(newTitle) {
    this.$viewTitle.innerHTML = newTitle + ':';
  }
  
  this.disableBackButton = function () {
    this.$backButton.style.visibility = "hidden";
  }
  
  this.setBackButton = function (callback) {
    this.$backButton.style.visibility = "visible";
    
    if(this._prevBackButtonCallback) {
      this.$backButton.removeEventListener('click', this._prevBackButtonCallback)
    }

    this.$backButton.addEventListener('click', callback);
    
    this._prevBackButtonCallback = callback;
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
  this._defaultTemplate = function () {
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

  this._prepareRows = function (groups) {
    // Goal - aesthetically break up the smileys into rows
    // groups[0] - emoticons that fit in one cell
    // groups[1] - emoticons that fit in two cells
    // groups[2] - emoticons that fit in three cells
    // groups[3] - emoticons that fit in four cells

    rows = [];
    curColumn = 0;
    curRow = 0;
    i = 0;
    rows[0] = [];
    while(true) {

      smiley = groups[0].shift(1);
      colspan = 1;
      
      curColumn += colspan;
      rows[curRow].push({
        'text': smiley,
        'colspan': 1
      });


      if(groups[0].length == 0) {
        break;
      }

      // every time column reaches 4 that means we have to go to 
      if(curColumn == 4) {
        curRow++;
        rows[curRow] = [];
        curColumn = 0;
      }
    }

    return rows;
  }

  this._determineColspan = function(hash) {
    faketable = this._defaultTemplate();
    row = document.createElement('tr');
    cell = document.createElement('td');
    row.appendChild(cell);
    faketable.appendChild(row);
    parent.appendChild(faketable);

    cellWidth = cell.clientWidth/4 - 4;

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
      } else if(metrics[1] < (cellWidth*2 - 4)) {
        groups[1].push(hash[i]);
      } else if(metrics[1] < (cellWidth*3 - 4)) {
        groups[2].push(hash[i]);
      } else if(metrics[1] < (cellWidth*4 - 4)) {
        groups[3].push(hash[i]);
      }
    }

    parent.removeChild(faketable);
    return groups;
  }

  this._calculateTextWidth = function(string, parent) {
    var container = document.createElement('div')
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
