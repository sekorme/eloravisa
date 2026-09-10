/**
 * Photography used across the homepage.
 *
 * ------------------------------------------------------------------------
 * ONLY IMAGES THAT HAVE BEEN LOOKED AT APPEAR HERE
 * ------------------------------------------------------------------------
 * `public/` contains around twenty images. Only the five below are used,
 * because these are the ones whose contents were actually inspected before
 * being placed. Alt text has to describe what is genuinely in the frame — you
 * cannot write honest alt text for a file you have not opened, and a wrong
 * description is worse for a screen-reader user than no image at all.
 *
 * The unused files (`ekua.jpg`, `ambassador.jpeg`, `IMG_9093.jpg`,
 * `elora5/6.jpeg`, the large marketing PNGs) are fine to add — open them, write
 * real alt text, add an entry.
 *
 * ------------------------------------------------------------------------
 * WHAT THESE ARE AND ARE NOT
 * ------------------------------------------------------------------------
 * These are *editorial* images: they set tone and tell the arc of the journey.
 * None of them is attached to a testimonial, a named person, a claim about an
 * outcome, or a statistic. Captions describe the moment, never a result — a
 * photo of someone on a London street must not be captioned as a granted visa.
 *
 * `width`/`height` are the real intrinsic pixel dimensions, so `next/image`
 * reserves the right box and the page never shifts as they load.
 */

export interface StoryImage {
    src: string
    /** Describes what is in the frame. Never a claim. */
    alt: string
    width: number
    height: number
    /** Short editorial label rendered beside the image, where one is shown. */
    caption?: string
}

/**
 * Hero backdrop — the "preparation" beat.
 *
 * A student working in a university reading room. Chosen because it shows the
 * *work* of preparing rather than the reward of arriving, which is what the
 * product actually helps with.
 */
export const HERO_IMAGE: StoryImage = {
    src: "/elora1.jpeg",
    alt: "A student working at a laptop with an open textbook in a university library reading room, surrounded by other people studying.",
    width: 979,
    height: 653,
}

/**
 * Hero video.
 *
 * NOTE FOR WHOEVER MAINTAINS THIS: the contents of `herovideo.mp4` were not
 * verifiable from the toolchain used to build this page (no ffmpeg available),
 * so it has never been watched frame by frame. `HERO_IMAGE` is its poster, which
 * means there is never a blank or broken frame even if the file is unusable.
 *
 * Set `HERO_MEDIA.kind` to "image" to drop the video entirely.
 */
export const HERO_VIDEO = {
    src: "/herovideo.mp4",
    type: "video/mp4",
} as const

export const HERO_MEDIA = {
    /**
     * "video" plays HERO_VIDEO over HERO_IMAGE; "image" uses the still only.
     *
     * Set to "image" after actually watching `herovideo.mp4` rendered behind the
     * hero: the footage is a backlit silhouette of a person outdoors holding a
     * long blade-like object. Whatever it actually depicts, at hero scale behind
     * the words "Your visa journey" it reads as a figure with a weapon — which
     * is not a risk worth taking on the first screen of a product people trust
     * with their passport details.
     *
     * Flip back to "video" if you know the footage and want it; nothing else
     * needs to change, and HERO_IMAGE stays the poster either way.
     */
    kind: "image" as "video" | "image",
} as const

/** Live classes — learning alongside other people. */
export const CLASSES_IMAGE: StoryImage = {
    src: "/elora2.jpeg",
    alt: "A group of young people standing together on a sandy ridge under a blue sky, laughing and raising their hands.",
    width: 833,
    height: 556,
    caption: "Preparing alongside other applicants",
}

/** Destination guidance — the arrival beat. */
export const DESTINATION_IMAGE: StoryImage = {
    src: "/akyere.jpg",
    alt: "A young woman standing on a residential London street in summer, holding a phone and a bag, with white terraced houses behind her.",
    width: 1200,
    height: 1600,
    caption: "Arriving",
}

/** Final scene — arrival and the life that follows. */
export const FINAL_IMAGES: StoryImage[] = [
    {
        src: "/elora3.jpeg",
        alt: "A smiling young man with a backpack standing on a busy European city street.",
        width: 1037,
        height: 691,
        caption: "Settling in",
    },
    {
        src: "/elora4.jpeg",
        alt: "A black and white photograph of a woman in ski gear standing on a floodlit snow slope at night, holding a snowboard upright.",
        width: 768,
        height: 1024,
        caption: "Living it",
    },
]
