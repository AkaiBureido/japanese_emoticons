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


    // Algorithm:
    // First add all the 4 cell smileys
    while(groups[3].length != 0) {
      rows.unshift([
          {'text': groups[3].pop(), 'colspan': 4}
      ]);
    };
    
    // Second add all of the 2 cell smileys + 2 cell smileys
    // Goal - we want to somewhat evenly distribute 
    // [4](1 cell) rows
    // [2](2 cell) rows
    // [2](1 cell) + [1](2 cell) rows
    
    // lets forget that we have 3 cell smileys for now
    // lets see if we have any 2 cell widows
    // oneCellsLeft = groups[0];
    // spareTwoCells = groups[1].length - Math.floor(groups[1].length/2) * 2;
    // if(spareTwoCells) {
    //   // If we have a 2 cell spare it would be brilliant to have two 1 cells
    //   if(oneCellsLeft >= 2) {
    //       rows.unshift([
    //           {'text': groups[1].pop(), 'colspan': 2},
    //           {'text': groups[0].pop(), 'colspan': 1},
    //           {'text': groups[0].pop(), 'colspan': 1}
    //       ]);
    //       oneCellsLeft -= 2;
    //   // If we are not so very lucky then we'll have to do with stretching one 1 cell
    //   } else if(oneCellsLeft == 1) {
    //       rows.unshift([
    //           {'text': groups[1].pop(), 'colspan': 2},
    //           {'text': groups[0].pop(), 'colspan': 2},
    //       ]);
    //   
    //   }
    // }
    // We have gotten rid of 2 cell widows, now its party time provided we have some 1 cells left

    while(groups[1].length != 0) {

      if(groups[1].length >= 2) {
          rows.unshift([
              {'text': groups[1].pop(), 'colspan': 2},
              {'text': groups[1].pop(), 'colspan': 2}
          ]);
      } else {
        // For the last widow 2 cell smiley add two 1 cell smileys
        if(groups[0].length >= 2) {
          rows.unshift([
              {'text': groups[1].pop(), 'colspan': 2},
              {'text': groups[0].pop(), 'colspan': 1},
              {'text': groups[0].pop(), 'colspan': 1}
          ]);
      // If dont have two 1 cell smileys, make widow 1 cell smiley 2 cells wide
        } else if (groups[0].length == 1) {
          rows.unshift([
              {'text': groups[1].pop(), 'colspan': 2},
              {'text': groups[0].pop(), 'colspan': 2}
          ]);
        // If ran out of 1 cell smileys after widow, make widow 4 cells wide
        } else if (groups[0].length == 0) {
          rows.unshift([
              {'text': groups[1].pop(), 'colspan': 4}
          ]);
        }
      }
    }

    // // Third add 3 cell smileys + 1 cell smileys
    // while(groups[2].length != 0) {
    //   // If we have 1 cell smileys add one after the 3 cell smiley
    //   if(groups[0].length != 0) {
    //     rows.unshift([
    //         {'text': groups[2].pop(), 'colspan': 3},
    //         {'text': groups[0].pop(), 'colspan': 1},
    //     ]);
    //   // If we dont make smiley 4 cells wide
    //   } else {
    //     rows.unshift([
    //         {'text': groups[2].pop(), 'colspan': 4},
    //     ]);
    //   }
    // }

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
    //
    // For extra eye candy rotate each array by curRow

    return rows;
  }

  this._spareOneCells = function (groups) {
    // Ammount of one cells that will make table unbalanced
    spareOneCells = groups[0].length - Math.floor(groups[0].length/4) * 4;
    return spareOneCells;
  }

  this._spareTwoCells = function (groups) {
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
