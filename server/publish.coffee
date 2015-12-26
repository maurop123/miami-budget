Meteor.publish('slices', ()->
 # return Slices.find()
)
Meteor.publish('builtBudgets', ()->
  return BuiltBudgets.find()
)
