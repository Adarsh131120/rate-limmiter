import Nav from '../components/Nav';
import Hero from '../components/Hero';
import AlgorithmCompare from '../components/AlgorithmCompare';
import BucketSimulator from '../components/BucketSimulator';
import Architecture from '../components/Architecture';
import Atomicity from '../components/Atomicity';
import LiveApiPanel from '../components/LiveApiPanel';
import BuildStatus from '../components/BuildStatus';
import Footer from '../components/Footer';

export default function Page() {
  return (
    <main>
      <Nav />
      <Hero />
      <AlgorithmCompare />
      <BucketSimulator />
      <Architecture />
      <Atomicity />
      <LiveApiPanel />
      {/* <BuildStatus /> */}
      <Footer />
    </main>
  );
}
