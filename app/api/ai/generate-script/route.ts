import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const generateScriptSchema = z.object({
  prompt: z.string().min(1),
  type: z.enum(['commercial', 'documentary', 'tutorial', 'social', 'corporate']).default('commercial'),
  duration: z.enum(['30s', '60s', '90s', '2min', '5min']).default('60s'),
  tone: z.enum(['professional', 'casual', 'energetic', 'emotional', 'humorous']).default('professional'),
  targetAudience: z.string().optional(),
  brandName: z.string().optional()
})

// Mock AI responses based on input parameters
const generateMockScript = (data: z.infer<typeof generateScriptSchema>) => {
  const { prompt, type, duration, tone, targetAudience, brandName } = data

  const scripts = {
    commercial: {
      professional: `[OPENING SHOT: Product close-up]

NARRATOR (${tone}): Introducing ${brandName || 'our revolutionary product'} - the solution you've been waiting for.

[WIDE SHOT: Happy customers using product]

NARRATOR: ${prompt}

[PRODUCT DEMONSTRATION]

NARRATOR: Experience the difference. Choose ${brandName || 'excellence'}.

[CLOSING SHOT: Logo and tagline]

TAGLINE: ${brandName || 'Your Brand'} - Where Innovation Meets Quality.`,

      casual: `[OPENING: Person using product naturally]

PERSON: Hey, have you tried ${brandName || 'this amazing product'}?

[QUICK CUTS: Various people enjoying product]

PERSON: ${prompt}

[PRODUCT SHOWCASE]

PERSON: Seriously, you need to check this out.

[CLOSING: Social media style]

TEXT: ${brandName || 'Your Brand'} - Try it today!`,

      energetic: `[FAST-PACED MONTAGE]

NARRATOR (excited): ${brandName || 'This product'} is about to change everything!

[QUICK CUTS: Action shots, people celebrating]

NARRATOR: ${prompt}

[DRAMATIC PRODUCT REVEAL]

NARRATOR: Don't wait! Get ${brandName || 'it'} now!

[ENERGETIC CLOSING]

TAGLINE: ${brandName || 'Your Brand'} - Power Up Your Life!`
    },

    documentary: {
      professional: `[ESTABLISHING SHOT: Relevant location]

NARRATOR: In a world where ${prompt}, we find ourselves at a crossroads.

[INTERVIEW SHOTS: Expert talking]

EXPERT: The impact of this issue cannot be overstated.

[ARCHIVAL FOOTAGE]

NARRATOR: Through careful examination, we discover the truth behind ${prompt}.

[CLOSING SHOT: Thoughtful conclusion]

NARRATOR: The story continues, and so do we.`,

      emotional: `[INTIMATE SHOT: Subject's face]

NARRATOR (soft): Every story has a beginning, and this one starts with ${prompt}.

[PERSONAL MOMENTS]

SUBJECT: It changed everything for me.

[EMOTIONAL JOURNEY]

NARRATOR: Sometimes the smallest moments create the biggest impact.

[HOPEFUL CLOSING]

NARRATOR: This is just the beginning.`
    },

    tutorial: {
      professional: `[INTRO: Host in clean setting]

HOST: Welcome to today's tutorial. I'm going to show you how to ${prompt}.

[STEP 1: Clear demonstration]

HOST: First, we start with the basics. ${prompt}

[STEP 2: Detailed explanation]

HOST: Next, we move to the advanced techniques.

[STEP 3: Final result]

HOST: And there you have it! You've successfully learned to ${prompt}.

[OUTRO: Call to action]

HOST: Don't forget to subscribe for more tutorials like this.`,

      casual: `[INTRO: Host in relaxed setting]

HOST: Hey everyone! Today I'm going to teach you how to ${prompt}.

[DEMONSTRATION: Step by step]

HOST: So first thing's first - ${prompt}

[INTERACTIVE ELEMENTS]

HOST: Pretty cool, right? Now let's try the next part.

[FINAL RESULT]

HOST: And that's how you ${prompt}! Easy peasy.

[CLOSING: Personal touch]

HOST: Thanks for watching, and I'll see you in the next one!`
    }
  }

  const typeScripts = scripts[type] || scripts.commercial
  const toneScript = typeScripts[tone] || typeScripts.professional

  return toneScript
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = generateScriptSchema.parse(body)

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    const script = generateMockScript(data)

    return NextResponse.json({
      success: true,
      script,
      metadata: {
        type: data.type,
        duration: data.duration,
        tone: data.tone,
        wordCount: script.split(' ').length,
        estimatedDuration: data.duration,
        generatedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error generating script:', error)
    return NextResponse.json(
      { error: 'Failed to generate script' },
      { status: 500 }
    )
  }
}
