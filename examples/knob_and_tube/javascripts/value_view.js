(function (globals) {

  globals.ValueView = Backbone.View.extend({
  
    initialize: function () {
      this.model.bind('change:n', this.render);
    },
    
    n: function () {
      return parseInt(this.model.attributes.n);
    },
    
    events: {
      'click': 'swap'
    },
    
    swap: function () {
      var this_n = this.n();
      var that_model = this.model.collection.get(1 + Math.floor(Math.random() * this.model.collection.size()));
      var that_n = that_model.attributes.n;
      this.model.set({ n: that_n });
      that_model.set({ n: this_n });
    }
  
  });

})(window);