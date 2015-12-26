Meteor.methods(
  submitGraph: (slices)->
    budget = {}
    budget[slice.key] = parseInt(slice.value) for slice in slices
    BuiltBudgets.insert(budget)

  resetBuiltBudgets: ()->
    BuiltBudgets.remove({})
)
