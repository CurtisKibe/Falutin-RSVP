import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'screening',
  title: 'Screening',
  type: 'document',
  fields: [
    defineField({
      name: 'movie',
      title: 'Movie',
      type: 'reference',
      to: [{type: 'movie'}],
      validation: (Rule) => Rule.required(), 
    }),
    defineField({
      name: 'date',
      title: 'Screening Date & Time',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),

    // --- DISCUSSION LEAD ---
    defineField({
      name: 'discussionLead',
      title: 'Discussion Lead',
      type: 'string',
      description: 'Who is leading the conversation after the film?',
      placeholder: 'e.g. The Professor',
    }),

    // --- TICKET PRICING LOGIC ---
    defineField({
      name: 'isFree',
      title: '🎟️ Is this a Free Screening?',
      type: 'boolean',
      initialValue: false,
      description: 'Toggle ON for free events. This will hide the price field.',
    }),
    defineField({
      name: 'price',
      title: 'Ticket Price (KES)',
      type: 'number',
      hidden: ({ document }) => document?.isFree === true,
      validation: (Rule) => Rule.custom((price, context) => {
        if (!context.document?.isFree && (price === undefined || price === null)) {
          return 'Price is required for paid events.'
        }
        return true
      }),
    }),

    // --- VENUE ---
    defineField({
      name: 'locationName',
      title: 'Venue Name',
      type: 'string',
      initialValue: 'Harambee House, Kyuna'
    }),

    // --- MAP SETTINGS ---
    defineField({
      name: 'location',
      title: 'Map Coordinates',
      type: 'geopoint', 
      description: 'Click the map to drop a pin on the exact venue location.',
      initialValue: {
        lat: -1.2519032, 
        lng: 36.7711075,
        alt: 0
      }
    }),

    // --- SECRET SCREENING LOGIC ---
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

    // --- GALLERY ---
    defineField({
      name: 'gallery',
      title: 'Event Gallery',
      type: 'array',
      description: 'Upload photos from the event (Crowd, Setup, Vibes)',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true, 
          },
          fields: [
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
            }
          ]
        }
      ],
      options: {
        layout: 'grid',
      }
    }),
  ],
  
  // --- SECRET SCREENINGS ---
  preview: {
    select: {
      title: 'movie.title',
      date: 'date',
      media: 'movie.poster',
      isSecret: 'isSecret',
      redacted: 'redactedTitle',
    },
    prepare({ title, date, media, isSecret, redacted }) {
      return {
        title: isSecret ? `🔒 ${redacted || 'Secret Event'}` : title,
        subtitle: date ? new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString() : 'No date set',
        media: media,
      }
    },
  },
})