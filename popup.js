var JapaneseEmoticons = {
  collection: "",
  collectionPresent: "",
  
  inilialise: function() {
    var req = new XMLHttpRequest();
    req.onload = this.parseEmoticons.bind(this);
    req.open("get", chrome.extension.getURL("emoticons.json"), true);
    req.send();
  },

  buildMENU: function(category) {
    var table = document.getElementById('emotes')
  },

  insertTextAtCarret: function(newText) {
    document.activeElement.setRangeText("(^_^)")
  },

  parseEmoticons: function(e) {
    this.collection = JSON.parse(e.target.responseText)
    this.buildMENU()
  },
  
  // Utility functions
  getCategories: function() {
    return Object.keys(this.collection)
  },

  getSubCategories: function(category) {
    return Object.keys(this.collection[category])
  },

  getEmoticonList: function(superCategory, category) {
    if(this.collection[superCategory]) {
      return this.collection[superCategory][category]['list']
    } else {
      return
    }
  },

  calculateTextWidth: function(string, parent) {
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
