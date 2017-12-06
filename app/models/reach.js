import DS from 'ember-data';

export default DS.Model.extend({
  reachId: DS.attr('string'),
  name: DS.attr('string'),
  riverName: DS.attr('string'),
  riverAlternateName: DS.attr('string'),
  error: DS.attr('boolean'),
  notes: DS.attr('string'),
  abstract: DS.attr('string'),
  difficulty: DS.attr('string'),
  difficultyMinimum: DS.attr('string'),
  difficultyMaximum: DS.attr('string'),
  difficultyOutlier: DS.attr('string'),
  dateUpdateAw: DS.attr('date'),
  description: DS.attr('string')
});
