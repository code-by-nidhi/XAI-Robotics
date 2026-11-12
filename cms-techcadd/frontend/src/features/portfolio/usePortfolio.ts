import { portfolioApi } from '../../api'
import { createResourceHooks } from '../shared/createResourceHooks'

export const portfolioHooks = createResourceHooks('portfolio', portfolioApi)
