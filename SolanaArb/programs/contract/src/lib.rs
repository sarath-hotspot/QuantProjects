use anchor_lang::prelude::*;
use anchor_lang::solana_program::entrypoint::ProgramResult;
use crate::MyError::InvalidFirstByte;
use anchor_lang::prelude::Account;
use solana_program::program_pack::Pack; 

declare_id!("93wTDro7hH46fq8EkZMvyf6xNahHPngbJFr5zNtnwELQ");

#[program]
pub mod hello_anchor {
    use solana_program::program::invoke_signed;

    use super::*;

    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        msg!("In initialize");
        Ok(())
    }

    pub fn create(ctx: Context<Create>) -> ProgramResult {
        msg!("In create");
        let base_account = &mut ctx.accounts.base_account;
        base_account.count = 0;      
        Ok(())
    }

    pub fn increment(ctx: Context<Increment>) -> ProgramResult {
        msg!("In increment YYYY");
        let base_account = &mut ctx.accounts.base_account;
        base_account.count += 1;
        Ok(())
    }    

    pub fn increment_by(ctx: Context<Increment>, inc_by:u64) -> ProgramResult {
        msg!("In increment by XXXX");
        let base_account = &mut ctx.accounts.base_account;
        base_account.count += inc_by;
        Ok(())
    }    

    pub fn default<'info>(
        _program_id: &Pubkey,
        _accounts: &[AccountInfo<'info>],
        _data: &[u8]
    ) -> Result<()> {
        msg!("In default method");
        // AccountMeta::new(*destination_liquidity_info.key, false),
        // AccountMeta::new(*source_liquidity_info.key, false),
        // AccountMeta::new_readonly(*token_program_id.key, false),
        // let lenth = _accounts.len();
        // let len_str = format!("AccountLength={}", lenth);
        // msg!(&len_str);

        let account_info_iter = &mut _accounts.iter().peekable();
        // In this account we received requested amount.
        let source_liquidity_token_account_info:&AccountInfo = next_account_info(account_info_iter)?;
        // Need to transfer amount to this account.
        let destination_liquidity_token_account_info = next_account_info(account_info_iter)?;
        // Standard token program id.
        let token_program_id = next_account_info(account_info_iter)?;       
        // Our PDA address passed from client.
        let program_derived_account_info = next_account_info(account_info_iter)?;
        let token_mint_id = next_account_info(account_info_iter)?;

        // Print received accounts.
        msg!(&source_liquidity_token_account_info.key.to_string());
        msg!(&destination_liquidity_token_account_info.key.to_string());
        msg!(&token_program_id.key.to_string());
        msg!(&program_derived_account_info.key.to_string());
        msg!(&token_mint_id.key.to_string());

        // Verify that Received PDA address is expected.
        let (expected_program_derived_account_pubkey, _bump_seed) =
            Pubkey::find_program_address(&[b"flashloan"], _program_id);            
        require!(expected_program_derived_account_pubkey == *program_derived_account_info.key, MyError::InvalidPdaAddress);
        // msg!(&format!("Bump Seed = {}", bump_seed));

        // Print amount in current account. 
        let current_balance =
            spl_token::state::Account::unpack(&source_liquidity_token_account_info.data.borrow())?.amount;
        msg!(&format!("Balance={}", current_balance));

        // _data contains first byte as 0 and next 8 bytes as expected 
        // tokens to return to.
        // extract amount from data.
        let amount = 
        _data
        .get(1..9)
        .and_then(|slice| slice.try_into().ok())
        .map(u64::from_le_bytes)
        .ok_or(InvalidFirstByte);
        let amount = amount.unwrap();
        msg!(&amount.to_string());

        // Transfer amount back to destination.  START
        let authority_signer_seeds:&[&[u8]] = &[
            program_derived_account_info.key.as_ref(),
            &[_bump_seed],
        ];
        let transfer_instruction = spl_token::instruction::transfer(
            token_program_id.key,
            source_liquidity_token_account_info.key,
            destination_liquidity_token_account_info.key,
            program_derived_account_info.key,
            &[],
            amount
        ).unwrap();
        let _transfer_result = invoke_signed(&transfer_instruction, 
            &[source_liquidity_token_account_info.clone(), destination_liquidity_token_account_info.clone()], 
            &[authority_signer_seeds]);
        // Transfer amount back to destination. END

        msg!("Message done");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}

// Transaction instructions
#[derive(Accounts)]
pub struct Create<'info> {
    #[account(init, payer = user, space = 16 + 16)]
    pub base_account: Account<'info, BaseAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program <'info, System>,
}

// Transaction instructions
#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(mut)]
    pub base_account: Account<'info, BaseAccount>,
}

// An account that goes inside a transaction instruction
#[account]
pub struct BaseAccount {
    pub count: u64,
}

#[error_code]
pub enum MyError {
    #[msg("Expecting 0 as first byte")]
    InvalidFirstByte,
    #[msg("Given PDA address is invalid")]
    InvalidPdaAddress
}
