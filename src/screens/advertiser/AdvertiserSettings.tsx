import { useBreadcrumb } from '../../components/layout/breadcrumb'
import { UpcomingBanner } from '../Placeholders'
import { PageHeader } from '../../components/ui/primitives'
import { FormRow, TextField, RadioRow, FormActionBar } from '../../components/ui/parts'
import { ADVERTISER } from '../../data/mock'

export default function AdvertiserSettings() {
  useBreadcrumb([{ label: ADVERTISER.label, name: ADVERTISER.name }])
  return (
    <div className="pb-20">
      <PageHeader title="Advertiser settings" />
      <UpcomingBanner />
      <div className="px-6 pt-2">
        <FormRow label="Advertiser name">
          <TextField value={ADVERTISER.name} width="w-96" />
        </FormRow>
        <FormRow label="Advertiser ID">
          <div className="pt-2 text-14 text-gtext-secondary">{ADVERTISER.id}</div>
        </FormRow>
        <FormRow label="Time zone">
          <TextField value="(GMT+05:30) India Standard Time" width="w-96" />
        </FormRow>
        <FormRow label="Currency">
          <TextField value="Indian Rupee (INR ₹)" width="w-96" />
        </FormRow>
        <FormRow label="Default landing page">
          <TextField placeholder="https://www.kraftshala.com" width="w-96" />
        </FormRow>
        <FormRow label="Ad serving" hint="Choose how impressions are counted.">
          <RadioRow label="Standard delivery" checked />
          <RadioRow label="Even delivery" />
        </FormRow>
      </div>
      <FormActionBar />
    </div>
  )
}
