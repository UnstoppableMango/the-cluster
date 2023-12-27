module Pulumi where

foreign import data Output :: forall a. Type -> a

foreign import output :: forall a. a -> Output a
