import DS from 'ember-data';
import { computed } from '@ember/object';

export default DS.Model.extend({

  // properties direct from the returned values
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
  description: DS.attr('string'),

  // computed properties
  description500: computed('description', function() {
    return this.get('description').split(' ').splice(0,100).join(' ') + '...';
  })

});
