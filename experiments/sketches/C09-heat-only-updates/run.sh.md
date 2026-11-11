# C09 Update only where the heat was (staged growth, children from parents)

Run with the C08 runner, one arm (SC) and four ways to update:

    OPT='{"update":"all"}'      ... C08 as it was
    OPT='{"update":"wrong"}'    only pixels the column got wrong change
    OPT='{"update":"weighted"}' each pixel moves by its difference squared
    OPT='{"update":"hot"}'      the step is scaled by the flash's heat

40,000 flashes, seeds 1 and 2, 5% noise, shuffled. Results in results-<update>.json in the C08 folder.
