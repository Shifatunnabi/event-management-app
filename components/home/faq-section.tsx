"use client"

import Image from "next/image"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { faqs } from "@/data/faqs"

export default function FAQSection() {
  return (
    <section className="container mx-auto px-4 py-16">
      <h2 className="mb-12 text-center text-3xl font-bold">Frequently Asked Questions</h2>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-start">
        {/* Left side - Image */}
        <div className="relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden">
          <Image src="/images/faq-illustration.jpg" alt="FAQ Illustration" fill className="object-cover" />
        </div>

        {/* Right side - Accordion */}
        <div className="space-y-4">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq) => (
              <AccordionItem
                key={faq.id}
                value={`item-${faq.id}`}
                className="border rounded-xl px-6 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-left font-semibold hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-5">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
