Template.home.events(
  'submit form': (e) ->
    e.preventDefault();
    target = e.target
    Meteor.call(
      'sendEmail',
      to: 'hello@mptysquare.com'
      from: target.email.value
      subject: "[MptySquare Contact] " + target.subject.value
      text: target.name.value + " says... \n" + target.message.value
      html: ""
    )
    return false
)
