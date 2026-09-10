"""flytrader - a memecoin trader driven by a simulated fruit fly brain.

The strategy is the fly's proboscis extension reflex. Market momentum is fed
to the sugar-sensing gustatory receptor neurons of the FlyWire adult Drosophila
connectome; the position size is read off MN9, the motor neuron that extends
the proboscis when the fly decides something is worth eating.

Paper trading only. See execution.LiveBroker for why.
"""

from .brain import FlyBrain, LIFParams, Response, TrialResult
from .connectome import Connectome, load_connectome
from .decode import DecoderConfig, Intent, decode
from .encode import EncoderConfig, Taste, encode
from .execution import Fill, PaperBroker
from .feeds import CsvFeed, HttpFeed, SyntheticFeed, build_feed
from .taste import TasteCurve, calibrate
from .trader import FlyTrader, Session, Tick

__all__ = [
    "FlyBrain", "LIFParams", "Response", "TrialResult",
    "Connectome", "load_connectome",
    "DecoderConfig", "Intent", "decode",
    "EncoderConfig", "Taste", "encode",
    "Fill", "PaperBroker",
    "CsvFeed", "HttpFeed", "SyntheticFeed", "build_feed",
    "TasteCurve", "calibrate",
    "FlyTrader", "Session", "Tick",
]
