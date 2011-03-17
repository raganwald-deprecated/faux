Lazy Models and Collections
===

A Faux application can contain models and collections that are fetched from the server just once and thereafter are meant to be re-used. Faux provides a very simple mechanism for incorporating such models into controller methods. As you know from reading about [Misadventure][m], each method defined can contain one or more *calculations*. Here are some examples:

    controller.method('foo', {
      'model=': {
        id: function (id) { return SomeCollection.get(id); } // calculates the model if given an id
      },
      'id=': {
        model: function (model) { return model.id; } // calculates the id if given the model
      }
      // ...
    });

    controller.method('widget', {
      'model=': function () { return new SomeModelOrOther(); } // calculates the model
      // ...
    });
    
In each case, Faux invokes the function supplied by the calculation every time the method is called. There's another way to provide a value, provided that the value is a Backbone Model or Collection. This is called providing a *constant* model or collection rather than a function:

    controller.method('widget', {
      'model=': new SomeModelOrOther() // calculates the model immediately and uses it thereafter
      // ...
    });
    
You can simply supply a model or collection rather than a function, and Faux will use it. A constant model or collection will not be recalculated every time the method is called. So note that `'model=': new SomeModelOrOther()` creates a new `SomeModelOrOther` once, while `'model=': function () { return new SomeModelOrOther(); }` is going to create a new `SomeModelOrOther` every time the method is called.

So, if you want to use the same model or collection every time a method is called, simply supply it as a constant model or collection in the calculation and there you go.

**but the title of this readme said something about lazy models**

Right. So the next issue is that your model or collection might need to come from a server, be expensive to calculate, or you might have some other reason you wish to avoid loading it until you need it. Faux can help. Whenever a constant model or collection is provided, Faux does a simple check. If it's a model, Faux checks to see whether the model's `attributes` are empty. If it's a collection, Faux checks to see whether the collection's `models` is empty.

If the `attributes` for a model or the `models` for a collection is empty, Faux calls `.fetch()` before displaying the methods' view. Therefore, if you have a collection that is loaded via JSON from a server, you can do something like this:


    WidgetCollection = Backbone.Collection.extend({
      model: Widget,
      url: '/widgets'
    });

    controller.method('widgets', {
      'model=': new WidgetCollection()
      // ...
    });
    
Since the collection will be empty the first time the method is called, Faux will fetch the collection. You can also use this to for collections or models that aren't backed by a server: Simply define your own `.fetch({ success: ... })` method. Be sure to handle `options.success` properly. The example code does exactly that: Its model has a custom `.fetch` method so that you can try the example without setting up a local server:

    var lazy_model = new (Backbone.Model.extend({
      // The 'fetch' method simulates a request to the server
      fetch : function(options) {
        options || (options = {});
        if (!this.set({message: "Hello, Lazy World"}, options)) return false;
        if (options.success) options.success(this, {message: "Hello, Lazy World"});
        return this;
      }
    }))();

    controller
      .method('constant', {
        'model=': lazy_model,
        clazz: Backbone.View
      });
      
And that, as they say, is that!

[m]: http://unspace.github.com/faux/examples/misadventure/