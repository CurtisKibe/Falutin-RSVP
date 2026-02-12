import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'discussion',
  title: 'Discussion Prompt',
  type: 'document',
  fields: [
    defineField({
      name: 'topic',
      title: 'Discussion Topic',
      type: 'string',
      description: 'E.g. "The symbolism of red in The Matrix"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Context / Prompt',
      type: 'text',
      description: 'Give members a bit of context to start the conversation.',
    }),
    defineField({
      name: 'featuredImage',
      title: 'Topic Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'isActive',
      title: 'Set as Current Topic',
      type: 'boolean',
      initialValue: true,
    }),
  ],
})