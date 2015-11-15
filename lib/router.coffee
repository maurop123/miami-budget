Router.configure(
  layoutTemplate: 'appBody'
  waitOn: ()->
    return [
      Meteor.subscribe('builtBudgets')
    ]
)

Router.route('/', () ->
  this.render('home')
)

Router.route('sunburst')
Router.route('budget-builder', ()->
  this.render('form')
)
Router.route('pie')
Router.route('three-eleven')
