import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'movie',
  title: 'Movie',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'poster',
      title: 'Poster',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'description',
      title: 'Synopsis',
      type: 'text',
    }),
    defineField({
      name: 'themes',
      title: 'Themes',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        layout: 'tags'
      }
    }),
    defineField({
      name: 'trailer',
      title: 'YouTube URL',
      type: 'url',
    }),
    defineField({
      name: 'isSecret',
      title: '🔒 Secret Screening?',
      type: 'boolean',
      description: 'If active, the movie details will be hidden on the member page.',
      initialValue: false,
    }),
    defineField({
      name: 'redactedTitle',
      title: 'Codename',
      type: 'string',
      hidden: ({ document }) => !document?.isSecret, 
      description: 'The fake title shown to members (e.g. PROJECT REDACTED)',
    }),
    defineField({
      name: 'clues',
      title: 'Clues',
      type: 'array',
      hidden: ({ document }) => !document?.isSecret,
      of: [{ type: 'string' }],
      description: 'Hints about the movie (e.g. "1990s", "Neo-Noir", "Twist Ending")',
    }),
    defineField({
      name: 'revealDate',
      title: 'Reveal Date',
      type: 'datetime',
      hidden: ({ document }) => !document?.isSecret,
      description: 'When the timer hits zero.',
    }),
  ],
})