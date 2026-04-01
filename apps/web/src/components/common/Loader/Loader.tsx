import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { FlexBox } from '../FlexBox'
import styles from './Loader.module.css'

export const Loader = () => (
  <FlexBox padding='2rem' justifyContent='center'>
    <AiOutlineLoading3Quarters className={styles.spinner} size={24} />
  </FlexBox>
)
