"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PopupAdsTab from "@/components/admin/popup-ads-tab"
import StaticAdsTab from "@/components/admin/static-ads-tab"

export default function AdsManagementPage() {
  const [activeTab, setActiveTab] = useState("popup")

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-4xl font-bold text-center mb-2">Advertisement Management</h1>
        <p className="text-center text-muted-foreground">Manage pop-up and static advertisements</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="popup" className="text-base">
            Pop-up Ads
          </TabsTrigger>
          <TabsTrigger value="static" className="text-base">
            Static Ads
          </TabsTrigger>
        </TabsList>

        <TabsContent value="popup" className="space-y-6">
          <PopupAdsTab />
        </TabsContent>

        <TabsContent value="static" className="space-y-6">
          <StaticAdsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
