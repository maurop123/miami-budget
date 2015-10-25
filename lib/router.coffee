Router.route('/', () ->
  this.layout('home')
  this.render('portfolio/default', {to: 'portfolio'})
 ,
  name: 'home'
)

Router.route('/portfolio/:_id', () ->
  this.layout('home')
  id = this.params._id
  this.render(id, {to: 'portfolio'})
)
