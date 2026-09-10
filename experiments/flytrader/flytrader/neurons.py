"""Named neurons in the FlyWire FAFB v783 connectome.

Every ID here is taken from the code published with Shiu et al. (2024). They
are the model's characterised sensorimotor pathway: stimulate the sugar-sensing
gustatory receptor neurons and MN9 fires, driving proboscis extension - the
fly's decision that something in front of it is worth eating.

That pathway is the whole basis for this project, so keep the provenance:
if you add IDs, say where they came from.
"""

from __future__ import annotations

# Labellar sugar-sensing gustatory receptor neurons, right hemisphere.
# Source: Drosophila_brain_model/figures.ipynb, `neu_sugar` (Figure 1D).
SUGAR_GRN_RIGHT = (
    720575940624963786,
    720575940630233916,
    720575940637568838,
    720575940638202345,
    720575940617000768,
    720575940630797113,
    720575940632889389,
    720575940621754367,
    720575940621502051,
    720575940640649691,
    720575940639332736,
    720575940616885538,
    720575940639198653,
    720575940620900446,
    720575940617937543,
    720575940632425919,
    720575940633143833,
    720575940612670570,
    720575940628853239,
    720575940629176663,
    720575940611875570,
)

# MN9, the motor neuron driving proboscis extension. Left and right.
# Source: Drosophila_brain_model/figures.ipynb, `ids_mn9` (Figure 2).
MN9_LEFT = 720575940660219265
MN9_RIGHT = 720575940645521262
MN9 = (MN9_LEFT, MN9_RIGHT)

# Salivary gland motor neuron - fires when the fly commits to feeding, so it is
# a useful second opinion on the same decision.
# Source: Drosophila_brain_model/sez_neurons.pickle, type 'Salivary_MN13'.
SALIVARY_MN13_TYPE = "Salivary_MN13"

# Aversive input channel. Bitter-sensing (Gr66a) GRNs are not included in the
# published model's data files, and this project deliberately does not invent
# IDs for them. To use the aversive channel, look the bitter GRNs up in FlyWire
# Codex (https://codex.flywire.ai, search cell type 'Gr66a') and pass them via
# `--bitter-ids`. With this left empty the trader runs on the appetitive
# pathway alone, which is the pathway the paper actually characterises.
BITTER_GRN: tuple[int, ...] = ()
