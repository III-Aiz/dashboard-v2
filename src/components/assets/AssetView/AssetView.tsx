import { FC, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { Flex, Grid, Select, Switch, TextInput } from '@mantine/core'

import { useAtom } from 'jotai'

import { useInputStyles } from 'src/components/inputs/useInputStyles'
import {
  assetSortChoosedAtom,
  assetSortReverseAtom,
  assetViewChoosedAtom,
} from 'src/states'
import { selectOwnedRealtokens } from 'src/store/features/wallets/walletsSelector'
import { OwnedRealtoken } from 'src/store/features/wallets/walletsSelector'

import { AssetGrid } from '../AssetGrid/AssetGrid'
import { AssetTable } from '../AssetTable/AssetTable'
import { AssetSortType } from '../assetSortType'
import { AssetViewType } from '../assetViewType'

interface AssetView {
  type: AssetViewType
  title: string
  component: React.ReactElement
  disabled?: boolean
}

function filterBySearch(realtokens: OwnedRealtoken[], search: string) {
  const cleanSearch = search.trim().toLowerCase()
  return !cleanSearch
    ? realtokens
    : realtokens.filter((item) => {
        return (
          item.shortName.toLowerCase().includes(cleanSearch) ||
          item.fullName.toLowerCase().includes(cleanSearch)
        )
      })
}

export const AssetView: FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'assetView' })

  const [choosenAssetView, setChoosenAssetView] = useAtom(assetViewChoosedAtom)
  const [choosenAssetSort, setChoosenAssetSort] = useAtom(assetSortChoosedAtom)
  const [choosenAssetSortReverse, setChoosenAssetSortReverse] =
    useAtom(assetSortReverseAtom)
  const [assetSearch, setAssetSearch] = useState('')
  const realtokens = useSelector(selectOwnedRealtokens)

  const realtokensData = useMemo(() => {
    const result = filterBySearch(realtokens.slice(), assetSearch)
    result.sort((a, b) => {
      switch (choosenAssetSort) {
        case AssetSortType.VALUE:
          return b.value - a.value
        case AssetSortType.APR:
          return b.annualPercentageYield - a.annualPercentageYield
        case AssetSortType.RENT:
          return (
            b.amount * b.netRentDayPerToken - a.amount * a.netRentDayPerToken
          )
        case AssetSortType.RENTSTART:
          return a.rentStartDate.date.localeCompare(b.rentStartDate.date)
        case AssetSortType.NAME:
          return a.shortName.localeCompare(b.shortName)
        case AssetSortType.SUPPLY:
          return b.totalInvestment - a.totalInvestment
        case AssetSortType.TOKEN:
          return b.amount - a.amount
        case AssetSortType.TOTAL_UNIT:
          return b.totalUnits - a.totalUnits
        case AssetSortType.RENTED_UNIT:
          return b.rentedUnits - a.rentedUnits
        case AssetSortType.OCCUPANCY:
          return b.rentedUnits / b.totalUnits - a.rentedUnits / a.totalUnits
        default:
          return 0
      }
    })

    if (choosenAssetSortReverse) {
      result.reverse()
    }

    return result
  }, [choosenAssetSort, choosenAssetSortReverse, assetSearch, realtokens])

  const sortOptions = [
    { value: AssetSortType.NAME, label: t('sortOptions.name') },
    { value: AssetSortType.VALUE, label: t('sortOptions.value') },
    { value: AssetSortType.SUPPLY, label: t('sortOptions.supply') },
    { value: AssetSortType.APR, label: t('sortOptions.apr') },
    { value: AssetSortType.RENT, label: t('sortOptions.rent') },
    { value: AssetSortType.RENTSTART, label: t('sortOptions.rentStart') },
    { value: AssetSortType.TOKEN, label: t('sortOptions.token') },
    { value: AssetSortType.TOTAL_UNIT, label: t('sortOptions.totalUnit') },
    { value: AssetSortType.RENTED_UNIT, label: t('sortOptions.rentedUnit') },
    { value: AssetSortType.OCCUPANCY, label: t('sortOptions.occupancy') },
  ]

  const availableViews = useMemo(() => {
    return new Map<AssetViewType, AssetView>([
      [
        AssetViewType.TABLE,
        {
          type: AssetViewType.TABLE,
          title: t('viewOptions.table'),
          component: <AssetTable key={'table'} realtokens={realtokensData} />,
        },
      ],
      [
        AssetViewType.GRID,
        {
          type: AssetViewType.GRID,
          title: t('viewOptions.grid'),
          component: <AssetGrid key={'grid'} realtokens={realtokensData} />,
        },
      ],
    ])
  }, [realtokensData, t])

  const datas = useMemo(() => {
    return [...availableViews].map(([, value]) => ({
      value: value.type,
      label: value.title,
    }))
  }, [availableViews])

  const getViewComponent = (): AssetView['component'] | undefined => {
    return [...availableViews.values()].find(
      (item) => item.type == choosenAssetView
    )?.component
  }

  const { classes: inputClasses } = useInputStyles()

  return (
    <>
      <Grid>
        <Grid.Col
          xs={12}
          sm={'content'}
          style={{ width: '300px', maxWidth: '100%' }}
        >
          <TextInput
            label={t('search')}
            value={assetSearch}
            size={'xs'}
            onChange={(event) => setAssetSearch(event.currentTarget.value)}
            style={{ width: '100%' }}
            classNames={inputClasses}
          />
        </Grid.Col>
        <Grid.Col span={'auto'}>
          <Flex align={'center'} gap={'sm'}>
            <Select
              label={t('sort')}
              data={sortOptions}
              value={choosenAssetSort}
              onChange={(value) => value && setChoosenAssetSort(value)}
              classNames={inputClasses}
            />
            <span>{t('sortReverse')}</span>
            <Switch
              checked={choosenAssetSortReverse}
              onChange={(value) =>
                setChoosenAssetSortReverse(value.currentTarget.checked)
              }
            />
          </Flex>
        </Grid.Col>
        <Grid.Col xs={12} sm={'content'}>
          <Select
            label={t('view')}
            data={datas}
            value={choosenAssetView}
            onChange={(value) => value && setChoosenAssetView(value)}
            classNames={inputClasses}
          />
        </Grid.Col>
      </Grid>
      {getViewComponent()}
    </>
  )
}
