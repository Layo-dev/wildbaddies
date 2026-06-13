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
        <title>Wild Baddies — Free Adult Videos</title>
        <meta name="description" content="Wild Baddies — The home of curvaceous and confident baddies. Free adult videos updated daily." />
        <link rel="canonical" href="https://wildbaddies.com/" />
      </Helmet>
      <Header />
      {/*<AdBanner />*/}
      <main>
        <h1 className="sr-only">Baddies — Featured Videos and Promoted Models</h1>
        <FeaturedVideos />
        <ExoSliderAd />
        <PromotedModels />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
