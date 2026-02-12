import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'poll',
  title: 'Community Poll',
  type: 'document',
  fields: [
    defineField({
      name: 'question',
      title: 'Poll Question',
      type: 'string',
      description: 'E.g. "What should we screen next month?"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'options',
      title: 'Movie Options',
      type: 'array',
      description: 'Add the movies members can vote for.',
      of: [{ type: 'reference', to: { type: 'movie' } }], 
      validation: (Rule) => Rule.min(2).max(4),
    }),
    defineField({
      name: 'isActive',
      title: 'Is Active?',
      type: 'boolean',
      description: 'Only one poll should be active at a time.',
      initialValue: false,
    }),
    defineField({
      name: 'expiresAt',
      title: 'Expiration Date',
      type: 'datetime',
    }),
  ],
  preview: {
    select: {
      title: 'question',
      isActive: 'isActive',
    },
    prepare({ title, isActive }) {
      return {
        title: title,
        subtitle: isActive ? '🟢 Active' : '⚪ Inactive',
      }
    },
  },
})