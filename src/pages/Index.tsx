import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import FeaturedVideos from "@/components/FeaturedVideos";
import PromotedModels from "@/components/PromotedModels";
import Footer from "@/components/Footer";
import ExoSliderAd from "@/components/ExoSliderAd";
//import AdBanner from "@/components/AdBanner";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Wild Baddies | Baddies Porn</title>
        <meta
          name="description"
          content="Wild Baddies — Free baddies porn videos, OnlyFans clips, Latina, Ebony & thick amateurs. Daily new explicit videos and photos. Watch the wildest baddies now."
        />
        <link rel="canonical" href="https://wildbaddies.com/" />
      </Helmet>
      <Header />
      {/*<AdBanner />*/}
      <main>
        <h1 className="sr-only"> Wild Baddies - Baddies Porn</h1>
        <FeaturedVideos />
        <ExoSliderAd />
        <PromotedModels />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
