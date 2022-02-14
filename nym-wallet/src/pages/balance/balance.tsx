import React, { useContext, useEffect } from 'react'
import { Alert, Button, Grid, Link, Typography } from '@mui/material'
import { AccountBalanceWalletOutlined, OpenInNew } from '@mui/icons-material'
import { NymCard, ClientAddress } from '../../components'
import { ClientContext, urls } from '../../context/main'

export const BalanceCard = () => {
  const { userBalance, clientDetails, network } = useContext(ClientContext)

  useEffect(() => {
    userBalance.fetchBalance()
  }, [])

  return (
    <NymCard
      title="Balance"
      data-testid="check-balance"
      Icon={AccountBalanceWalletOutlined}
      Action={<ClientAddress withCopy />}
    >
      <Grid container direction="column" spacing={2}>
        <Grid item>
          {userBalance.error && (
            <Alert severity="error" data-testid="error-refresh" sx={{ p: 2 }}>
              {userBalance.error}
            </Alert>
          )}
          {!userBalance.error && (
            <Typography
              data-testid="refresh-success"
              sx={{ p: 2, color: 'nym.background.dark' }}
              variant="h5"
              fontWeight="700"
            >
              {userBalance.balance?.printable_balance}
            </Typography>
          )}
        </Grid>
        {network && (
          <Grid item>
            <Link
              sx={{ pl: 1 }}
              href={`${urls(network).blockExplorer}/account/${clientDetails?.client_address}`}
              target="_blank"
            >
              <Button endIcon={<OpenInNew />}>Last transactions</Button>
            </Link>
          </Grid>
        )}
      </Grid>
    </NymCard>
  )
}