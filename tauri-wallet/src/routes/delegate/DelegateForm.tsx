import React, { useContext } from 'react'
import {
  Button,
  CircularProgress,
  FormControl,
  Grid,
  InputAdornment,
  TextField,
  Theme,
  useTheme,
} from '@material-ui/core'
import { useForm } from 'react-hook-form'
import { NodeTypeSelector } from '../../components/NodeTypeSelector'
import { EnumNodeType, TFee } from '../../types'
import { yupResolver } from '@hookform/resolvers/yup'
import { validationSchema } from './validationSchema'
import { invoke } from '@tauri-apps/api'
import { Alert } from '@material-ui/lab'
import { ClientContext } from '../../context/main'
import { majorToMinor } from '../../requests'

type TDelegateForm = {
  nodeType: EnumNodeType
  identity: string
  amount: string
}

const defaultValues: TDelegateForm = {
  nodeType: EnumNodeType.mixnode,
  identity: '',
  amount: '',
}

export const DelegateForm = ({
  fees,
  onError,
  onSuccess,
}: {
  fees: TFee
  onError: (message?: string) => void
  onSuccess: (message?: string) => void
}) => {
  const theme = useTheme<Theme>()
  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TDelegateForm>({
    defaultValues,
    resolver: yupResolver(validationSchema),
  })

  const watchNodeType = watch('nodeType', defaultValues.nodeType)

  const { getBalance } = useContext(ClientContext)

  const onSubmit = async (data: TDelegateForm) => {
    const amount = await majorToMinor(data.amount)

    await invoke(`delegate_to_${data.nodeType}`, {
      identity: data.identity,
      amount,
    })
      .then((res: any) => {
        console.log(res)
        onSuccess(res)
        getBalance.fetchBalance()
      })
      .catch((e) => {
        console.log(e)
        onError(e)
      })
  }

  return (
    <FormControl fullWidth>
      <div style={{ padding: theme.spacing(3, 5) }}>
        <Grid container spacing={3}>
          <Grid container item xs={12} justifyContent="space-between">
            <Grid item>
              <NodeTypeSelector
                nodeType={watchNodeType}
                setNodeType={(nodeType) => setValue('nodeType', nodeType)}
              />
            </Grid>
            <Grid item>
              <Alert severity="info">
                {`A fee of ${
                  watchNodeType === EnumNodeType.mixnode
                    ? fees.mixnode.amount
                    : fees.gateway.amount
                } PUNK will apply to this transaction`}
              </Alert>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <TextField
              {...register('identity')}
              required
              variant="outlined"
              id="identity"
              name="identity"
              label="Node identity"
              fullWidth
              error={!!errors.identity}
              helperText={errors?.identity?.message}
            />
          </Grid>

          <Grid item xs={12} lg={6}>
            <TextField
              {...register('amount')}
              required
              variant="outlined"
              id="amount"
              name="amount"
              label="Amount to delegate"
              fullWidth
              error={!!errors.amount}
              helperText={errors?.amount?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">punks</InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          borderTop: `1px solid ${theme.palette.grey[200]}`,
          background: theme.palette.grey[100],
          padding: theme.spacing(2),
        }}
      >
        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          variant="contained"
          color="primary"
          type="submit"
          disableElevation
          endIcon={isSubmitting && <CircularProgress size={20} />}
        >
          Delegate stake
        </Button>
      </div>
    </FormControl>
  )
}