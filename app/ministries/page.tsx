import { SiteLayout } from "@/components/layout/site-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Music,
  Sparkles,
  Users,
  Heart,
  UserCircle,
  Baby,
  Stethoscope,
  Globe,
  BookOpen,
  MessageCircle,
  Shield,
  ArrowRight,
  Church,
} from "lucide-react"
import { createClient } from "@/lib/supabase/server"

const iconMap: Record<string, React.ElementType> = {
  Music,
  Sparkles,
  Users,
  Heart,
  UserCircle,
  Baby,
  Stethoscope,
  Globe,
  BookOpen,
  MessageCircle,
  Shield,
  Church,
}

const fallbackMinistries = [
  { name: "Music Ministry", description: "Leading the congregation in worship through music and song.", icon: "Music", color: "bg-[var(--church-primary)]" },
  { name: "Dance Ministry", description: "Expressing worship through movement and dance.", icon: "Sparkles", color: "bg-pink-500" },
  { name: "Singles and Adults Ministry", description: "Connecting single adults through fellowship and service.", icon: "Users", color: "bg-[var(--church-gold)]" },
  { name: "Youth Ministry", description: "Empowering young people to live out their faith.", icon: "UserCircle", color: "bg-emerald-500" },
  { name: "Men's Ministry", description: "Building godly men through accountability and fellowship.", icon: "Users", color: "bg-[var(--church-primary-deep)]" },
  { name: "Women's Ministry", description: "Nurturing women in their faith journey.", icon: "Heart", color: "bg-rose-500" },
  { name: "Children's Ministry", description: "Teaching children the Word of God in fun ways.", icon: "Baby", color: "bg-orange-500" },
  { name: "Health Ministry", description: "Caring for the physical well-being of our community.", icon: "Stethoscope", color: "bg-red-500" },
  { name: "Missions and Evangelism Ministry", description: "Spreading the Gospel locally and globally.", icon: "Globe", color: "bg-[var(--church-primary)]" },
  { name: "Discipleship Group", description: "Growing deeper in faith through intentional Bible study.", icon: "BookOpen", color: "bg-indigo-500" },
  { name: "Counseling Ministry", description: "Providing spiritual and emotional support.", icon: "MessageCircle", color: "bg-teal-500" },
]

export default async function MinistriesPage() {
  const supabase = await createClient()
  const { data: dbMinistries } = await supabase
    .from('ministries')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  const ministries = dbMinistries && dbMinistries.length > 0 ? dbMinistries : fallbackMinistries

  return (
    <SiteLayout>
      {/* Hero Section */}
      <section className="pt-24 pb-16 lg:pt-32 lg:pb-20 bg-gradient-to-br from-[var(--church-primary)] to-[var(--church-primary-deep)]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">Our Ministries</h1>
            <p className="text-xl text-white/90">
              Discover your place in our church family. We have ministries for everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Ministries Grid */}
      <section className="py-16 lg:py-24 bg-[var(--church-light-blue)]">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ministries.map((ministry, index) => {
                const IconComponent = iconMap[ministry.icon] || Church
                return (
                  <Card key={index} className="bg-background border-none shadow-lg hover:shadow-xl transition-shadow group">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className={`w-14 h-14 rounded-xl ${ministry.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <IconComponent className="w-7 h-7 text-white" />
                        </div>
                      </div>
                      <CardTitle className="text-xl text-foreground group-hover:text-[var(--church-primary)] transition-colors">
                        {ministry.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {ministry.description}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Join CTA */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Ready to Serve?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              We believe everyone has a unique gift to contribute to the body of Christ.
              Join a ministry today and discover how you can make a difference.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-[var(--church-primary)] hover:bg-[var(--church-primary-deep)] text-white w-full sm:w-auto">
                  Become a Member
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/counseling">
                <Button size="lg" variant="outline" className="border-[var(--church-primary)] text-[var(--church-primary)] hover:bg-[var(--church-primary)] hover:text-white w-full sm:w-auto">
                  Talk to a Pastor
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  )
}
