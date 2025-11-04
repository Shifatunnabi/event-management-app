export interface HeroSlide {
  id: string
  title: string
  subtitle: string
  image: string
  link: string
}

export const heroSlides: HeroSlide[] = [
  {
    id: "1",
    title: "NEON COUNTDOWN 2025",
    subtitle: "Early Bird Available Now!",
    image: "https://img.freepik.com/premium-vector/trendy-event-banner-template_85212-590.jpg", // Updated to use generated image
    link: "/events/1",
  },
  {
    id: "2",
    title: "Tech Summit 2025",
    subtitle: "Join the Future of Technology",
    image: "https://thumbs.dreamstime.com/b/music-banner-event-137560964.jpg", // Updated to use generated image
    link: "/events/2",
  },
  {
    id: "3",
    title: "Food & Wine Festival",
    subtitle: "Free Entry - Limited Spots",
    image: "https://static.vecteezy.com/system/resources/previews/025/480/992/non_2x/music-event-geometric-abstract-banner-template-minimal-gradient-abstract-background-for-poster-flyer-presentation-and-cover-illustration-vector.jpg", // Updated to use generated image
    link: "/events/3",
  },
]
