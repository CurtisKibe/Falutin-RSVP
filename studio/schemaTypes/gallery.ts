import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'gallery',
  title: 'Gallery Images',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Caption',
      type: 'string',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'date',
      title: 'Date Taken',
      type: 'date',
    }),
  ],
})