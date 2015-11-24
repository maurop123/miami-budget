Meteor.startup ( ->
  Meteor.Mailgun.config(
    username: 'postmaster@mptysquare.com'
    password: '41ffcd0bf5d282d3f0ff516e138db78b'
  )
)

Meteor.methods(
  sendEmail: (field) ->

    check([field.to, field.from, field.subject, field.text, field.html], [String])

    this.unblock()

    Meteor.Mailgun.send({
      to: field.to
      from: field.from
      subject: field.subject
      text: field.text
      html: field.html
    })
    console.log('email sent')
)
